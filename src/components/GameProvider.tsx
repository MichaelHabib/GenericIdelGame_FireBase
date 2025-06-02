
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { GameContextType, PurchasedUpgrade, InventoryItem, ActiveBuff, AcquiredArtifice, AcquiredAchievement, PurchasedPrestigeUpgrade, GameStateSnapshot } from "@/lib/types";
import { AVAILABLE_UPGRADES, calculateExponentialUpgradeCost } from "@/config/upgrades";
import { AVAILABLE_ITEMS } from "@/config/items";
import { AVAILABLE_ARTIFICES } from "@/config/artifices";
import { AVAILABLE_ACHIEVEMENTS } from "@/config/achievements";
import { AVAILABLE_PRESTIGE_UPGRADES } from "@/config/prestige";
import { 
  INITIAL_POINTS, POINTS_PER_CLICK, 
  ITEM_DROP_CHANCE_PER_SECOND, ARTIFICE_DROP_CHANCE_PER_SECOND, 
  ITEM_DROP_CHANCE_PER_CLICK, ARTIFICE_DROP_CHANCE_PER_CLICK, 
  SAVE_GAME_KEY, AUTOSAVE_INTERVAL, MAX_OFFLINE_EARNING_DURATION_SECONDS,
  INITIAL_LEGACY_TOKENS, PRESTIGE_POINTS_REQUIREMENT, LEGACY_TOKEN_FORMULA,
  PRESTIGE_REQUIREMENT_INCREASE_FACTOR
} from "@/config/gameConfig";
import { useToast } from "@/hooks/use-toast";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState(INITIAL_POINTS);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<Record<string, PurchasedUpgrade>>({});
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [acquiredArtifices, setAcquiredArtifices] = useState<Record<string, AcquiredArtifice>>({});
  const [gameInitialized, setGameInitialized] = useState(false);
  const [totalManualClicks, setTotalManualClicks] = useState(0);
  const [acquiredAchievements, setAcquiredAchievements] = useState<Record<string, AcquiredAchievement>>({});
  
  // Prestige State
  const [legacyTokens, setLegacyTokens] = useState(INITIAL_LEGACY_TOKENS);
  const [purchasedPrestigeUpgrades, setPurchasedPrestigeUpgrades] = useState<Record<string, PurchasedPrestigeUpgrade>>({});
  const [currentPrestigeRequirement, setCurrentPrestigeRequirement] = useState(PRESTIGE_POINTS_REQUIREMENT);
  const [prestigeCount, setPrestigeCount] = useState(0);


  const { toast } = useToast();

  const currentPointsPerClick = useMemo(() => {
    let basePPC = POINTS_PER_CLICK;
    Object.values(acquiredArtifices).forEach(artifice => {
      const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
      if (artificeDef?.effect.type === "GLOBAL_CLICK_POWER_MULTIPLIER") {
        basePPC *= artificeDef.effect.value;
      }
    });
    // Apply prestige PPC boosts
    Object.values(purchasedPrestigeUpgrades).forEach(pu => {
      const prestigeDef = AVAILABLE_PRESTIGE_UPGRADES.find(p => p.id === pu.id);
      if (prestigeDef?.effect.type === "GLOBAL_PPC_BOOST_PRESTIGE") {
        basePPC *= (1 + prestigeDef.effect.value * pu.level);
      }
    });
    return basePPC;
  }, [acquiredArtifices, purchasedPrestigeUpgrades]);

  const currentTotalPointsPerSecond = useMemo(() => {
    let basePPS = 0;
    Object.values(purchasedUpgrades).forEach(purchasedUpg => {
      const def = AVAILABLE_UPGRADES.find(u => u.id === purchasedUpg.id);
      if (def) {
        let upgradePPS = def.ppsPerUnit * purchasedUpg.quantity;
        Object.values(acquiredArtifices).forEach(artifice => {
          const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
          if (artificeDef?.effect.type === "UPGRADE_SPECIFIC_PPS_MULTIPLIER" && artificeDef.effect.upgradeId === def.id) {
            upgradePPS *= artificeDef.effect.value;
          }
        });
        basePPS += upgradePPS;
      }
    });

    let ppsWithTemporaryBuffs = basePPS;
    const now = Date.now();
    activeBuffs.forEach(buff => {
      if (now < buff.expiresAt) {
        if (buff.effectType === "PPS_MULTIPLIER") {
          ppsWithTemporaryBuffs *= buff.value;
        }
      }
    });

    let finalPPS = ppsWithTemporaryBuffs;
    Object.values(acquiredArtifices).forEach(artifice => {
      const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
      if (artificeDef?.effect.type === "GLOBAL_PPS_MULTIPLIER") {
        finalPPS *= artificeDef.effect.value;
      }
    });
    // Apply prestige PPS boosts
    Object.values(purchasedPrestigeUpgrades).forEach(pu => {
      const prestigeDef = AVAILABLE_PRESTIGE_UPGRADES.find(p => p.id === pu.id);
      if (prestigeDef?.effect.type === "GLOBAL_PPS_BOOST_PRESTIGE") {
        finalPPS *= (1 + prestigeDef.effect.value * pu.level);
      }
    });
    return finalPPS;
  }, [purchasedUpgrades, activeBuffs, acquiredArtifices, purchasedPrestigeUpgrades]);


  const saveGame = useCallback(() => {
    if (!gameInitialized) return;
    try {
      const gameState = {
        points,
        purchasedUpgrades,
        inventory,
        acquiredArtifices,
        totalManualClicks,
        acquiredAchievements,
        legacyTokens,
        purchasedPrestigeUpgrades,
        currentPrestigeRequirement,
        prestigeCount,
        lastSaveTimestamp: Date.now(),
        version: "2.2", // Incremented version for prestige
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }, [points, purchasedUpgrades, inventory, acquiredArtifices, totalManualClicks, acquiredAchievements, legacyTokens, purchasedPrestigeUpgrades, currentPrestigeRequirement, prestigeCount, gameInitialized]);

  const checkAndGrantAchievements = useCallback(() => {
    const gameSnapshot: GameStateSnapshot = {
        points,
        purchasedUpgrades,
        inventory,
        acquiredArtifices,
        totalManualClicks,
        legacyTokens,
        purchasedPrestigeUpgrades
    };

    AVAILABLE_ACHIEVEMENTS.forEach(ach => {
      if (!acquiredAchievements[ach.id] && ach.condition(gameSnapshot)) {
        setAcquiredAchievements(prev => ({
          ...prev,
          [ach.id]: { achievementId: ach.id, acquiredAt: Date.now() },
        }));

        let rewardMsg = "";
        if (ach.reward.type === "POINTS") {
          setPoints(p => p + ach.reward.value);
          rewardMsg = `+${ach.reward.value} Points!`;
        } else if (ach.reward.type === "ITEM") {
          const itemDef = AVAILABLE_ITEMS.find(item => item.id === ach.reward.itemId);
           if(itemDef){
            setInventory(prevInv => {
              const currentQuantity = prevInv[ach.reward.itemId]?.quantity || 0;
              return {
                ...prevInv,
                [ach.reward.itemId]: { itemId: ach.reward.itemId, quantity: currentQuantity + ach.reward.quantity },
              };
            });
            rewardMsg = `+${ach.reward.quantity} ${itemDef.name}!`;
          }
        }
        setTimeout(() => {
          toast({
            title: `Achievement Unlocked: ${ach.name}!`,
            description: `${ach.description} ${rewardMsg}`,
            duration: 5000,
          });
        }, 0);
      }
    });
  }, [points, purchasedUpgrades, inventory, acquiredArtifices, totalManualClicks, acquiredAchievements, legacyTokens, purchasedPrestigeUpgrades, toast]);


  const loadGame = useCallback(() => {
    try {
      const savedGame = localStorage.getItem(SAVE_GAME_KEY);
      if (savedGame) {
        const gameState = JSON.parse(savedGame);
        
        let loadedPoints = gameState.points || INITIAL_POINTS;
        const loadedPurchasedUpgrades = gameState.purchasedUpgrades || {};
        const loadedInventory = gameState.inventory || {};
        const loadedAcquiredArtifices = gameState.acquiredArtifices || {};
        const loadedTotalManualClicks = gameState.totalManualClicks || 0;
        const loadedAcquiredAchievements = gameState.acquiredAchievements || {};
        const loadedLegacyTokens = gameState.legacyTokens || INITIAL_LEGACY_TOKENS;
        const loadedPurchasedPrestigeUpgrades = gameState.purchasedPrestigeUpgrades || {};
        const loadedPrestigeCount = gameState.prestigeCount || 0;
        const loadedCurrentPrestigeRequirement = gameState.currentPrestigeRequirement || PRESTIGE_POINTS_REQUIREMENT * Math.pow(PRESTIGE_REQUIREMENT_INCREASE_FACTOR, loadedPrestigeCount);


        if (gameState.lastSaveTimestamp) {
          // Calculate offline PPS based on saved state before applying prestige effects from current load
          const ppsAtSaveTime = (() => { 
            let basePPS = 0;
            Object.values(loadedPurchasedUpgrades).forEach((purchasedUpg: any) => { 
              const def = AVAILABLE_UPGRADES.find(u => u.id === purchasedUpg.id);
              if (def) {
                let upgradePPS = def.ppsPerUnit * purchasedUpg.quantity;
                Object.values(loadedAcquiredArtifices).forEach((artifice: any) => {
                    const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
                    if (artificeDef?.effect.type === "UPGRADE_SPECIFIC_PPS_MULTIPLIER" && artificeDef.effect.upgradeId === def.id) {
                        upgradePPS *= artificeDef.effect.value;
                    }
                });
                basePPS += upgradePPS;
              }
            });
            Object.values(loadedAcquiredArtifices).forEach((artifice: any) => {
              const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
              if (artificeDef?.effect.type === "GLOBAL_PPS_MULTIPLIER") {
                basePPS *= artificeDef.effect.value;
              }
            });
             // Apply prestige PPS boosts from saved state
            Object.values(loadedPurchasedPrestigeUpgrades).forEach((pu: any) => {
                const prestigeDef = AVAILABLE_PRESTIGE_UPGRADES.find(p => p.id === pu.id);
                if (prestigeDef?.effect.type === "GLOBAL_PPS_BOOST_PRESTIGE") {
                    basePPS *= (1 + prestigeDef.effect.value * pu.level);
                }
            });
            return basePPS;
          })();

          const now = Date.now();
          let elapsedSecondsOffline = (now - gameState.lastSaveTimestamp) / 1000;
          elapsedSecondsOffline = Math.min(elapsedSecondsOffline, MAX_OFFLINE_EARNING_DURATION_SECONDS);
          
          if (elapsedSecondsOffline > 0 && ppsAtSaveTime > 0) {
            const offlinePointsEarned = Math.floor(elapsedSecondsOffline * ppsAtSaveTime);
            if (offlinePointsEarned > 0) {
              loadedPoints += offlinePointsEarned;
              setTimeout(() => {
                toast({ title: "Welcome Back!", description: `You earned ${offlinePointsEarned.toLocaleString()} points while away.` });
              }, 100);
            }
          }
        }

        setPoints(loadedPoints);
        setPurchasedUpgrades(loadedPurchasedUpgrades);
        setInventory(loadedInventory);
        setAcquiredArtifices(loadedAcquiredArtifices);
        setTotalManualClicks(loadedTotalManualClicks);
        setAcquiredAchievements(loadedAcquiredAchievements);
        setLegacyTokens(loadedLegacyTokens);
        setPurchasedPrestigeUpgrades(loadedPurchasedPrestigeUpgrades);
        setCurrentPrestigeRequirement(loadedCurrentPrestigeRequirement);
        setPrestigeCount(loadedPrestigeCount);

        setActiveBuffs([]); // Buffs are not saved
        
        setTimeout(() => {
          toast({ title: "Game Loaded", description: "Your progress has been restored." });
        }, 0);
      } else {
        setActiveBuffs([]);
        setCurrentPrestigeRequirement(PRESTIGE_POINTS_REQUIREMENT);
        setPrestigeCount(0);
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      setPoints(INITIAL_POINTS);
      setPurchasedUpgrades({});
      setInventory({});
      setAcquiredArtifices({});
      setTotalManualClicks(0);
      setAcquiredAchievements({});
      setLegacyTokens(INITIAL_LEGACY_TOKENS);
      setPurchasedPrestigeUpgrades({});
      setCurrentPrestigeRequirement(PRESTIGE_POINTS_REQUIREMENT);
      setPrestigeCount(0);
      setActiveBuffs([]);
    }
    setGameInitialized(true);
  }, [toast]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const prestigeGame = useCallback(() => {
    if (points < currentPrestigeRequirement) {
      toast({
        title: "Prestige Not Available",
        description: `You need ${currentPrestigeRequirement.toLocaleString()} points to prestige. You currently have ${points.toLocaleString()} points.`,
        variant: "destructive",
      });
      return;
    }

    const earnedLT = LEGACY_TOKEN_FORMULA(points);
    setLegacyTokens(prev => prev + earnedLT);
    
    let startingPointsAfterPrestige = INITIAL_POINTS;
    const headStartUpgrade = purchasedPrestigeUpgrades['prestige_starting_points'];
    if (headStartUpgrade && headStartUpgrade.level > 0) {
        // Assuming the "Head Start" upgrade gives a flat 1000 points and doesn't stack its effect with levels,
        // or it's a one-time purchase. If it stacks, this logic needs to change.
        // For now, let's make it a flat 1000 if purchased.
        startingPointsAfterPrestige = 1000;
    }

    setPoints(startingPointsAfterPrestige);
    setPurchasedUpgrades({});
    setInventory({});
    setActiveBuffs([]);
    // Acquired Artifices and Achievements are kept
    // Purchased Prestige Upgrades are kept

    const newPrestigeCount = prestigeCount + 1;
    setPrestigeCount(newPrestigeCount);
    setCurrentPrestigeRequirement(PRESTIGE_POINTS_REQUIREMENT * Math.pow(PRESTIGE_REQUIREMENT_INCREASE_FACTOR, newPrestigeCount));


    toast({
      title: "Prestiged!",
      description: `You earned ${earnedLT} Legacy Tokens! Your game has been reset, but permanent bonuses remain.`,
      duration: 7000,
    });
    saveGame();
  }, [points, currentPrestigeRequirement, legacyTokens, prestigeCount, toast, saveGame, purchasedPrestigeUpgrades]);


  const purchasePrestigeUpgrade = useCallback((upgradeId: string) => {
    const upgradeDef = AVAILABLE_PRESTIGE_UPGRADES.find(upg => upg.id === upgradeId);
    if (!upgradeDef) {
      toast({ title: "Error", description: "Prestige upgrade not found.", variant: "destructive" });
      return;
    }

    const currentLevel = purchasedPrestigeUpgrades[upgradeId]?.level || 0;
    if (upgradeDef.maxLevel && currentLevel >= upgradeDef.maxLevel) {
      toast({ title: "Max Level Reached", description: `You already have the maximum level for ${upgradeDef.name}.`, variant: "default" });
      return;
    }
    
    // For simplicity, let's assume cost doesn't scale with level for now, or it's a flat cost per level.
    // If cost scales, this logic needs to be more complex.
    const cost = upgradeDef.cost;

    if (legacyTokens >= cost) {
      setLegacyTokens(prev => prev - cost);
      setPurchasedPrestigeUpgrades(prev => ({
        ...prev,
        [upgradeId]: { id: upgradeId, level: currentLevel + 1 },
      }));
      toast({
        title: "Prestige Upgrade Purchased!",
        description: `You purchased ${upgradeDef.name} (Level ${currentLevel + 1}) for ${cost} Legacy Tokens.`,
      });
      saveGame();
    } else {
      toast({
        title: "Insufficient Legacy Tokens",
        description: `Not enough Legacy Tokens to purchase ${upgradeDef.name}.`,
        variant: "destructive",
      });
    }
  }, [legacyTokens, purchasedPrestigeUpgrades, toast, saveGame]);


  const resetGame = useCallback(() => {
    setPoints(INITIAL_POINTS);
    setPurchasedUpgrades({});
    setInventory({});
    setActiveBuffs([]);
    setAcquiredArtifices({});
    setTotalManualClicks(0);
    setAcquiredAchievements({});
    setLegacyTokens(INITIAL_LEGACY_TOKENS);
    setPurchasedPrestigeUpgrades({});
    setCurrentPrestigeRequirement(PRESTIGE_POINTS_REQUIREMENT);
    setPrestigeCount(0);

    setTimeout(() => {
      toast({ title: "Game Reset", description: "Started a new clicking adventure!" });
    }, 0);
    try {
      localStorage.removeItem(SAVE_GAME_KEY);
      const initialGameState = {
        points: INITIAL_POINTS,
        purchasedUpgrades: {},
        inventory: {},
        acquiredArtifices: {},
        totalManualClicks: 0,
        acquiredAchievements: {},
        legacyTokens: INITIAL_LEGACY_TOKENS,
        purchasedPrestigeUpgrades: {},
        currentPrestigeRequirement: PRESTIGE_POINTS_REQUIREMENT,
        prestigeCount: 0,
        lastSaveTimestamp: Date.now(),
        version: "2.2",
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(initialGameState));
    } catch (error) {
      console.error("Failed to save reset game state:", error);
    }
    if (!gameInitialized) {
      setGameInitialized(true);
    }
  }, [toast, gameInitialized]);

  useEffect(() => {
    if (gameInitialized) {
      const autoSaveTimer = setInterval(saveGame, AUTOSAVE_INTERVAL);
      return () => clearInterval(autoSaveTimer);
    }
  }, [saveGame, gameInitialized]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameInitialized) {
        saveGame();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveGame, gameInitialized]);
  
  useEffect(() => {
    if(gameInitialized){
      checkAndGrantAchievements();
    }
  }, [points, purchasedUpgrades, totalManualClicks, acquiredArtifices, inventory, legacyTokens, purchasedPrestigeUpgrades, gameInitialized, checkAndGrantAchievements]);

  const addItemToInventory = useCallback((itemId: string, quantity: number = 1) => {
    const itemDef = AVAILABLE_ITEMS.find(item => item.id === itemId);
    if (!itemDef) {
      console.error("Attempted to add unknown item:", itemId);
      return;
    }
    setInventory(prevInventory => {
      const existingItem = prevInventory[itemId];
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newQuantity = currentQuantity + quantity;
      setTimeout(() => {
        toast({
          title: "Item Acquired!",
          description: `You found: ${itemDef.name}!`,
        });
      }, 0);
      return {
        ...prevInventory,
        [itemId]: { itemId, quantity: newQuantity },
      };
    });
    // saveGame(); // Save game is called by checkAndGrantAchievements or by other actions
  }, [toast]);

  const addArtificeToCollection = useCallback((artificeId: string) => {
    const artificeDef = AVAILABLE_ARTIFICES.find(art => art.id === artificeId);
    if (!artificeDef) {
      console.error("Attempted to add unknown artifice:", artificeId);
      return;
    }
    if (acquiredArtifices[artificeId]) return; // Already acquired

    setAcquiredArtifices(prev => ({
      ...prev,
      [artificeId]: { artificeId, acquiredAt: Date.now() }
    }));
    setTimeout(() => {
      toast({
        title: "Artifice Acquired!",
        description: `${artificeDef.name} - ${artificeDef.effectDescription}`,
        variant: "default",
        duration: 5000,
      });
    }, 0);
    // saveGame();
  }, [toast, acquiredArtifices]);

  const useItem = useCallback((itemId: string) => {
    const itemDef = AVAILABLE_ITEMS.find(item => item.id === itemId);
    const inventoryItem = inventory[itemId];

    if (!itemDef || !inventoryItem || inventoryItem.quantity <= 0) {
      setTimeout(() => {
        toast({ title: "Item Error", description: "Cannot use this item.", variant: "destructive" });
      }, 0);
      return;
    }

    setInventory(prev => {
      const newInventory = { ...prev };
      if (newInventory[itemId].quantity > 1) {
        newInventory[itemId].quantity -= 1;
      } else {
        delete newInventory[itemId];
      }
      return newInventory;
    });

    switch (itemDef.effect.type) {
      case "INSTANT_POINTS":
        setPoints(prev => prev + itemDef.effect.value);
        setTimeout(() => {
          toast({ title: `${itemDef.name} Used!`, description: `Gained ${itemDef.effect.value.toFixed(0)} Points!` });
        }, 0);
        break;
      case "PPS_MULTIPLIER":
        if (itemDef.effect.durationSeconds) {
          setActiveBuffs(prevBuffs => {
            const now = Date.now();
            let buffFoundAndStacked = false;
            let newBuffs = prevBuffs.map(buff => {
              if (buff.itemId === itemDef.id && buff.effectType === itemDef.effect.type) {
                buffFoundAndStacked = true;
                return {
                  ...buff,
                  expiresAt: Math.max(now, buff.expiresAt) + itemDef.effect.durationSeconds! * 1000,
                  value: itemDef.effect.value, 
                };
              }
              return buff;
            }).filter(buff => now < buff.expiresAt); 

            if (buffFoundAndStacked) {
              return newBuffs;
            } else {
              // If a buff of the same *type* but different *item* exists, replace it.
              // If no buff of this type exists, add it.
              newBuffs = newBuffs.filter(buff => buff.effectType !== itemDef.effect.type);
              newBuffs.push({
                itemId: itemDef.id,
                effectType: itemDef.effect.type,
                value: itemDef.effect.value,
                expiresAt: now + itemDef.effect.durationSeconds! * 1000,
              });
              return newBuffs;
            }
          });
          setTimeout(() => {
            toast({ title: `${itemDef.name} Activated!`, description: `${itemDef.description}`, duration: itemDef.effect.durationSeconds! * 1000 });
          }, 0);
        }
        break;
    }
    // saveGame();
  }, [inventory, toast]);
  

  useEffect(() => {
    if (!gameInitialized) return;
    const gameLoop = setInterval(() => {
      let itemDropModifier = 1; // Default, can be increased by prestige upgrades
      const artificeAttunement = purchasedPrestigeUpgrades['prestige_artifice_chance'];
      if (artificeAttunement) {
        // Example: +10% chance per level. Adjust this factor as needed.
        itemDropModifier *= (1 + (0.1 * artificeAttunement.level)); 
      }


      if (Math.random() < ITEM_DROP_CHANCE_PER_SECOND * itemDropModifier) {
        const availableToDrop = AVAILABLE_ITEMS;
        if (availableToDrop.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableToDrop.length);
          addItemToInventory(availableToDrop[randomIndex].id);
        }
      }
      
      if (Math.random() < ARTIFICE_DROP_CHANCE_PER_SECOND * itemDropModifier) {
        const unacquiredArtifices = AVAILABLE_ARTIFICES.filter(artDef => !acquiredArtifices[artDef.id]);
        if (unacquiredArtifices.length > 0) {
          const randomIndex = Math.floor(Math.random() * unacquiredArtifices.length);
          addArtificeToCollection(unacquiredArtifices[randomIndex].id);
        }
      }
      
      const now = Date.now();
      const activeBuffsStillActive = activeBuffs.filter(buff => {
        if (now >= buff.expiresAt) {
          const itemDef = AVAILABLE_ITEMS.find(item => item.id === buff.itemId);
          setTimeout(() => {
            toast({ title: "Buff Expired", description: `${itemDef?.name || 'A buff'} has worn off.` });
          }, 0);
          return false;
        }
        return true;
      });
      if (activeBuffsStillActive.length !== activeBuffs.length) {
        setActiveBuffs(activeBuffsStillActive);
      }

      setPoints(prevPoints => prevPoints + currentTotalPointsPerSecond);
    }, 1000);
    return () => clearInterval(gameLoop);
  }, [currentTotalPointsPerSecond, gameInitialized, toast, addItemToInventory, activeBuffs, acquiredArtifices, addArtificeToCollection, purchasedPrestigeUpgrades]);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    const upgradeDef = AVAILABLE_UPGRADES.find(upg => upg.id === upgradeId);
    if (!upgradeDef) {
      setTimeout(() => {
        toast({ title: "Error", description: "Upgrade definition not found.", variant: "destructive" });
      }, 0);
      return;
    }

    const numCurrentlyPurchased = purchasedUpgrades[upgradeId]?.quantity || 0;
    let actualPurchaseCost = calculateExponentialUpgradeCost(upgradeDef.baseCost, numCurrentlyPurchased);

    Object.values(acquiredArtifices).forEach(artifice => {
      const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
      if (artificeDef) {
        if (artificeDef.effect.type === "ALL_UPGRADES_COST_MULTIPLIER") {
          actualPurchaseCost *= artificeDef.effect.value;
        }
        if (artificeDef.effect.type === "SPECIFIC_UPGRADE_COST_MULTIPLIER" && artificeDef.effect.upgradeId === upgradeId) {
          actualPurchaseCost *= artificeDef.effect.value;
        }
      }
    });

    // Apply prestige cost reduction
    const economicInsight = purchasedPrestigeUpgrades['prestige_cheaper_upgrades'];
    if (economicInsight) {
        // Example: 2% reduction per level
        actualPurchaseCost *= (1 - (0.02 * economicInsight.level));
    }


    if (points >= actualPurchaseCost) {
      setPoints(prev => prev - actualPurchaseCost);
      setPurchasedUpgrades(prev => {
        const newPurchased = { ...prev };
        if (newPurchased[upgradeId]) {
          newPurchased[upgradeId].quantity += 1;
        } else {
          newPurchased[upgradeId] = { id: upgradeId, quantity: 1 };
        }
        return newPurchased;
      });
      setTimeout(() => {
        toast({
          title: "Upgrade Purchased!",
          description: `You purchased a ${upgradeDef.name} for ${actualPurchaseCost.toFixed(0)} Points.`,
        });
      }, 0);
      saveGame();
    } else {
      setTimeout(() => {
        toast({
          title: "Insufficient Points",
          description: `Not enough points to purchase ${upgradeDef.name}. Need ${actualPurchaseCost.toFixed(0)}, have ${points.toFixed(0)}.`,
          variant: "destructive",
        });
      }, 0);
    }
  }, [points, toast, purchasedUpgrades, acquiredArtifices, saveGame, purchasedPrestigeUpgrades]);

  const clickMasterButton = useCallback(() => {
    setPoints(prev => prev + currentPointsPerClick);
    setTotalManualClicks(prev => prev + 1);

    let itemDropModifier = 1; // Default
    const artificeAttunement = purchasedPrestigeUpgrades['prestige_artifice_chance'];
    if (artificeAttunement) {
      itemDropModifier *= (1 + (0.1 * artificeAttunement.level));
    }


    if (Math.random() < ITEM_DROP_CHANCE_PER_CLICK * itemDropModifier) {
        const availableToDrop = AVAILABLE_ITEMS;
        if (availableToDrop.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableToDrop.length);
          addItemToInventory(availableToDrop[randomIndex].id);
        }
    }
    if (Math.random() < ARTIFICE_DROP_CHANCE_PER_CLICK * itemDropModifier) {
      const unacquiredArtifices = AVAILABLE_ARTIFICES.filter(artDef => !acquiredArtifices[artDef.id]);
      if (unacquiredArtifices.length > 0) {
        const randomIndex = Math.floor(Math.random() * unacquiredArtifices.length);
        addArtificeToCollection(unacquiredArtifices[randomIndex].id);
      }
    }
  }, [currentPointsPerClick, addItemToInventory, addArtificeToCollection, acquiredArtifices, purchasedPrestigeUpgrades]);

  const contextValue = useMemo(() => ({
    points,
    setPoints,
    purchasedUpgrades,
    purchaseUpgrade,
    clickMasterButton,
    pointsPerClick: currentPointsPerClick,
    totalPointsPerSecond: currentTotalPointsPerSecond,
    resetGame,
    gameInitialized,
    inventory,
    addItemToInventory,
    useItem,
    activeBuffs,
    acquiredArtifices,
    acquiredAchievements,
    totalManualClicks,
    legacyTokens,
    purchasedPrestigeUpgrades,
    prestigeGame,
    purchasePrestigeUpgrade,
    currentPrestigeRequirement,
    prestigeCount
  }), [
      points, purchasedUpgrades, purchaseUpgrade, clickMasterButton, currentPointsPerClick, 
      currentTotalPointsPerSecond, resetGame, gameInitialized, inventory, addItemToInventory, 
      useItem, activeBuffs, acquiredArtifices, acquiredAchievements, totalManualClicks,
      legacyTokens, purchasedPrestigeUpgrades, prestigeGame, purchasePrestigeUpgrade,
      currentPrestigeRequirement, prestigeCount
    ]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
