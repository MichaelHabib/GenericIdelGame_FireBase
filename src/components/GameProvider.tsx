
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { GameContextType, PurchasedUpgrade, InventoryItem, ActiveBuff, AcquiredArtifice } from "@/lib/types";
import { AVAILABLE_UPGRADES, calculateExponentialUpgradeCost } from "@/config/upgrades";
import { AVAILABLE_ITEMS } from "@/config/items";
import { AVAILABLE_ARTIFICES } from "@/config/artifices";
import { INITIAL_POINTS, POINTS_PER_CLICK, ITEM_DROP_CHANCE_PER_SECOND, ARTIFICE_DROP_CHANCE_PER_SECOND, ITEM_DROP_CHANCE_PER_CLICK, ARTIFICE_DROP_CHANCE_PER_CLICK, SAVE_GAME_KEY, AUTOSAVE_INTERVAL } from "@/config/gameConfig";
import { useToast } from "@/hooks/use-toast";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState(INITIAL_POINTS);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<Record<string, PurchasedUpgrade>>({});
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [acquiredArtifices, setAcquiredArtifices] = useState<Record<string, AcquiredArtifice>>({});
  const [gameInitialized, setGameInitialized] = useState(false);
  const { toast } = useToast();

  const saveGame = useCallback(() => {
    if (!gameInitialized) return; // Don't save if game hasn't even initialized
    try {
      const gameState = {
        points,
        purchasedUpgrades,
        inventory,
        acquiredArtifices,
        lastSaved: Date.now()
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
      // console.log("Game saved!"); // Optional: for debugging
    } catch (error) {
      console.error("Failed to save game:", error);
      // Optionally notify user if saving fails critically
    }
  }, [points, purchasedUpgrades, inventory, acquiredArtifices, gameInitialized]);

  const loadGame = useCallback(() => {
    try {
      const savedGame = localStorage.getItem(SAVE_GAME_KEY);
      if (savedGame) {
        const gameState = JSON.parse(savedGame);
        setPoints(gameState.points || INITIAL_POINTS);
        setPurchasedUpgrades(gameState.purchasedUpgrades || {});
        setInventory(gameState.inventory || {});
        setAcquiredArtifices(gameState.acquiredArtifices || {});
        // Do not load activeBuffs, they reset on load
        setActiveBuffs([]); 
        setTimeout(() => {
          toast({ title: "Game Loaded", description: "Your progress has been restored." });
        },0);
      } else {
        // No saved game, use initial values (already set by useState defaults)
        // but ensure buffs are clear
        setActiveBuffs([]);
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      // If loading fails, start a new game with initial values
      setPoints(INITIAL_POINTS);
      setPurchasedUpgrades({});
      setInventory({});
      setAcquiredArtifices({});
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
    // setGameInitialized(true); // loadGame will set this
    setTimeout(() => {
        toast({ title: "Game Reset", description: "Started a new clicking adventure!" });
    }, 0);
    // Save the reset state
    try {
        localStorage.removeItem(SAVE_GAME_KEY); // Clear old save specifically
         const initialGameState = {
            points: INITIAL_POINTS,
            purchasedUpgrades: {},
            inventory: {},
            acquiredArtifices: {},
            lastSaved: Date.now()
        };
        localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(initialGameState));
    } catch (error) {
        console.error("Failed to save reset game state:", error);
    }
    if (!gameInitialized) { // Ensure game is marked as initialized if it wasn't
        setGameInitialized(true);
    }
  }, [toast, gameInitialized]);


  useEffect(() => {
    if (gameInitialized) {
      const autoSaveTimer = setInterval(saveGame, AUTOSAVE_INTERVAL);
      return () => clearInterval(autoSaveTimer);
    }
  }, [saveGame, gameInitialized]);

  // Save on window unload as a fallback
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
    if (acquiredArtifices[artificeId]) {
      return; 
    }

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
      },0);
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
            });

            if (buffFoundAndStacked) {
              return newBuffs;
            } else {
              newBuffs = prevBuffs.filter(buff => {
                return !(buff.effectType === itemDef.effect.type && buff.itemId !== itemDef.id);
              });
              
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
          },0);
        }
        break;
    }
    saveGame();
  }, [inventory, toast, saveGame]);


  const { totalPointsPerSecond, pointsPerClick } = useMemo(() => {
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
    let currentPointsPerClick = POINTS_PER_CLICK;

    Object.values(acquiredArtifices).forEach(artifice => {
        const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
        if (artificeDef?.effect.type === "GLOBAL_PPS_MULTIPLIER") {
            finalPPS *= artificeDef.effect.value;
        }
        if (artificeDef?.effect.type === "GLOBAL_CLICK_POWER_MULTIPLIER") {
            currentPointsPerClick *= artificeDef.effect.value;
        }
    });

    return { totalPointsPerSecond: finalPPS, pointsPerClick: currentPointsPerClick };
  }, [purchasedUpgrades, activeBuffs, acquiredArtifices]);

  useEffect(() => {
    if (!gameInitialized) return;

    const gameLoop = setInterval(() => {
      if (Math.random() < ITEM_DROP_CHANCE_PER_SECOND) {
        const availableToDrop = AVAILABLE_ITEMS;
        if (availableToDrop.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableToDrop.length);
          addItemToInventory(availableToDrop[randomIndex].id);
        }
      }
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

      setPoints(prevPoints => prevPoints + totalPointsPerSecond); 
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [totalPointsPerSecond, gameInitialized, toast, addItemToInventory, activeBuffs, acquiredArtifices, addArtificeToCollection]);


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
      },0);
      saveGame();
    } else {
      setTimeout(() => {
        toast({
          title: "Insufficient Points",
          description: `Not enough points to purchase ${upgradeDef.name}. Need ${actualPurchaseCost.toFixed(0)}, have ${points.toFixed(0)}.`,
          variant: "destructive",
        });
      },0);
    }
  }, [points, toast, purchasedUpgrades, acquiredArtifices, saveGame]);

  const clickMasterButton = useCallback(() => {
    setPoints(prev => prev + pointsPerClick);
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
    // Note: saveGame() is not called here to avoid excessive writes on rapid clicks.
    // Relies on auto-save or saves on other key actions.
  }, [pointsPerClick, addItemToInventory, addArtificeToCollection, acquiredArtifices]);

  const contextValue = useMemo(() => ({
    points,
    setPoints,
    purchasedUpgrades,
    purchaseUpgrade,
    clickMasterButton,
    pointsPerClick,
    totalPointsPerSecond,
    resetGame,
    gameInitialized,
    inventory,
    addItemToInventory,
    useItem,
    activeBuffs,
    acquiredArtifices
  }), [points, purchasedUpgrades, purchaseUpgrade, clickMasterButton, pointsPerClick, totalPointsPerSecond, resetGame, gameInitialized, inventory, addItemToInventory, useItem, activeBuffs, acquiredArtifices]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

