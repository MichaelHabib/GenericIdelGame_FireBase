
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { GameContextType, PurchasedUpgrade, InventoryItem, ActiveBuff, AcquiredArtifice, AcquiredAchievement } from "@/lib/types";
import { AVAILABLE_UPGRADES, calculateExponentialUpgradeCost } from "@/config/upgrades";
import { AVAILABLE_ITEMS } from "@/config/items";
import { AVAILABLE_ARTIFICES } from "@/config/artifices";
import { AVAILABLE_ACHIEVEMENTS } from "@/config/achievements";
import { INITIAL_POINTS, POINTS_PER_CLICK, ITEM_DROP_CHANCE_PER_SECOND, ARTIFICE_DROP_CHANCE_PER_SECOND, ITEM_DROP_CHANCE_PER_CLICK, ARTIFICE_DROP_CHANCE_PER_CLICK, SAVE_GAME_KEY, AUTOSAVE_INTERVAL, MAX_OFFLINE_EARNING_DURATION_SECONDS } from "@/config/gameConfig"; // Removed FREE_UPGRADE_DROP_CHANCE_OF_ITEM_DROP as it's no longer used directly here for drops
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
  const { toast } = useToast();

  const currentPointsPerClick = useMemo(() => {
    let basePPC = POINTS_PER_CLICK;
    Object.values(acquiredArtifices).forEach(artifice => {
      const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
      if (artificeDef?.effect.type === "GLOBAL_CLICK_POWER_MULTIPLIER") {
        basePPC *= artificeDef.effect.value;
      }
    });
    return basePPC;
  }, [acquiredArtifices]);

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
    return finalPPS;
  }, [purchasedUpgrades, activeBuffs, acquiredArtifices]);


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
        lastSaveTimestamp: Date.now(),
        version: "2.1", // Incremented version for offline progression change if needed
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }, [points, purchasedUpgrades, inventory, acquiredArtifices, totalManualClicks, acquiredAchievements, gameInitialized]);

  const checkAndGrantAchievements = useCallback(() => {
    const gameSnapshot = {
        points,
        purchasedUpgrades,
        inventory,
        acquiredArtifices,
        totalManualClicks,
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
  }, [points, purchasedUpgrades, inventory, acquiredArtifices, totalManualClicks, acquiredAchievements, toast]);


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
        
        if (gameState.lastSaveTimestamp) {
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
        setActiveBuffs([]);
        
        setTimeout(() => {
          toast({ title: "Game Loaded", description: "Your progress has been restored." });
        }, 0);
      } else {
        setActiveBuffs([]);
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      setPoints(INITIAL_POINTS);
      setPurchasedUpgrades({});
      setInventory({});
      setAcquiredArtifices({});
      setTotalManualClicks(0);
      setAcquiredAchievements({});
      setActiveBuffs([]);
    }
    setGameInitialized(true);
  }, [toast]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const resetGame = useCallback(() => {
    setPoints(INITIAL_POINTS);
    setPurchasedUpgrades({});
    setInventory({});
    setActiveBuffs([]);
    setAcquiredArtifices({});
    setTotalManualClicks(0);
    setAcquiredAchievements({});
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
        lastSaveTimestamp: Date.now(),
        version: "2.1",
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
  }, [points, purchasedUpgrades, totalManualClicks, acquiredArtifices, inventory, gameInitialized, checkAndGrantAchievements]); // Added artifices and inventory to dependency array as achievements might depend on them

  // grantRandomFreeUpgrade is no longer called by random drops, but can be kept for other potential uses (e.g. achievement rewards)
  const grantRandomFreeUpgrade = useCallback(() => {
    if (AVAILABLE_UPGRADES.length === 0) return;
    const randomIndex = Math.floor(Math.random() * AVAILABLE_UPGRADES.length);
    const upgradeToGrant = AVAILABLE_UPGRADES[randomIndex];

    setPurchasedUpgrades(prev => {
      const newPurchased = { ...prev };
      if (newPurchased[upgradeToGrant.id]) {
        newPurchased[upgradeToGrant.id].quantity += 1;
      } else {
        newPurchased[upgradeToGrant.id] = { id: upgradeToGrant.id, quantity: 1 };
      }
      return newPurchased;
    });
    setTimeout(() => {
      toast({
        title: "Bonus Drop!",
        description: `You received a free ${upgradeToGrant.name}!`,
      });
    }, 0);
    saveGame(); 
  }, [toast, saveGame]);

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
    saveGame();
  }, [toast, saveGame]);

  const addArtificeToCollection = useCallback((artificeId: string) => {
    const artificeDef = AVAILABLE_ARTIFICES.find(art => art.id === artificeId);
    if (!artificeDef) {
      console.error("Attempted to add unknown artifice:", artificeId);
      return;
    }
    if (acquiredArtifices[artificeId]) return;

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
    saveGame();
  }, [toast, acquiredArtifices, saveGame]);

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
                  value: itemDef.effect.value, // ensure value is updated if item definition changes, though typically it won't for the same item ID
                };
              }
              return buff;
            }).filter(buff => now < buff.expiresAt); 

            if (buffFoundAndStacked) {
              return newBuffs;
            } else {
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
    saveGame();
  }, [inventory, toast, saveGame]);
  

  useEffect(() => {
    if (!gameInitialized) return;
    const gameLoop = setInterval(() => {
      // Item Drop Logic - No longer drops free upgrades
      if (Math.random() < ITEM_DROP_CHANCE_PER_SECOND) {
        const availableToDrop = AVAILABLE_ITEMS;
        if (availableToDrop.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableToDrop.length);
          addItemToInventory(availableToDrop[randomIndex].id);
        }
      }
      // Artifice Drop Logic
      if (Math.random() < ARTIFICE_DROP_CHANCE_PER_SECOND) {
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
  }, [currentTotalPointsPerSecond, gameInitialized, toast, addItemToInventory, activeBuffs, acquiredArtifices, addArtificeToCollection, grantRandomFreeUpgrade]);

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
  }, [points, toast, purchasedUpgrades, acquiredArtifices, saveGame]);

  const clickMasterButton = useCallback(() => {
    setPoints(prev => prev + currentPointsPerClick);
    setTotalManualClicks(prev => prev + 1);

    // Item Drop Logic on Click - No longer drops free upgrades
    if (Math.random() < ITEM_DROP_CHANCE_PER_CLICK) {
        const availableToDrop = AVAILABLE_ITEMS;
        if (availableToDrop.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableToDrop.length);
          addItemToInventory(availableToDrop[randomIndex].id);
        }
    }
    if (Math.random() < ARTIFICE_DROP_CHANCE_PER_CLICK) {
      const unacquiredArtifices = AVAILABLE_ARTIFICES.filter(artDef => !acquiredArtifices[artDef.id]);
      if (unacquiredArtifices.length > 0) {
        const randomIndex = Math.floor(Math.random() * unacquiredArtifices.length);
        addArtificeToCollection(unacquiredArtifices[randomIndex].id);
      }
    }
  }, [currentPointsPerClick, addItemToInventory, addArtificeToCollection, acquiredArtifices]); // Removed grantRandomFreeUpgrade from dependencies as it's not directly called for drops

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
    totalManualClicks
  }), [points, purchasedUpgrades, purchaseUpgrade, clickMasterButton, currentPointsPerClick, currentTotalPointsPerSecond, resetGame, gameInitialized, inventory, addItemToInventory, useItem, activeBuffs, acquiredArtifices, acquiredAchievements, totalManualClicks]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

    