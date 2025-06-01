
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { GameContextType, HiredEmployee, InventoryItem, ActiveBuff, AcquiredArtifice } from "@/lib/types";
import { AVAILABLE_EMPLOYEES, calculateExponentialHireCost } from "@/config/employees";
import { AVAILABLE_ITEMS } from "@/config/items";
import { AVAILABLE_ARTIFICES } from "@/config/artifices";
import { INITIAL_BALANCE, ITEM_DROP_CHANCE_PER_SECOND, ARTIFICE_DROP_CHANCE_PER_SECOND } from "@/config/gameConfig";
import { useToast } from "@/hooks/use-toast";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [hiredEmployees, setHiredEmployees] = useState<Record<string, HiredEmployee>>({});
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [acquiredArtifices, setAcquiredArtifices] = useState<Record<string, AcquiredArtifice>>({});
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const { toast } = useToast();

  const resetGame = useCallback(() => {
    setBalance(INITIAL_BALANCE);
    setHiredEmployees({});
    setInventory({});
    setActiveBuffs([]);
    setAcquiredArtifices({});
    setIsGameOver(false);
    setGameInitialized(true);
    setTimeout(() => {
        toast({ title: "Game Reset", description: "Started a new marketing empire!" });
    }, 0);
  }, [toast]);

  useEffect(() => {
    if (!gameInitialized) {
      resetGame();
    }
  }, [gameInitialized, resetGame]);

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
  }, [toast]);

  const addArtificeToCollection = useCallback((artificeId: string) => {
    const artificeDef = AVAILABLE_ARTIFICES.find(art => art.id === artificeId);
    if (!artificeDef) {
      console.error("Attempted to add unknown artifice:", artificeId);
      return;
    }
    if (acquiredArtifices[artificeId]) {
      // Already have this unique artifice
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
  }, [toast, acquiredArtifices]);
  
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

    const now = Date.now();
    switch (itemDef.effect.type) {
      case "INSTANT_BALANCE":
        setBalance(prev => prev + itemDef.effect.value);
        setTimeout(() => {
            toast({ title: `${itemDef.name} Used!`, description: `Gained $${itemDef.effect.value.toFixed(0)}!` });
        }, 0);
        break;
      case "INCOME_MULTIPLIER":
      case "UPKEEP_MULTIPLIER":
        if (itemDef.effect.durationSeconds) {
          setActiveBuffs(prevBuffs => prevBuffs.filter(buff => buff.itemId !== itemId && buff.effectType !== itemDef.effect.type));
          setActiveBuffs(prevBuffs => [
            ...prevBuffs,
            {
              itemId: itemDef.id,
              effectType: itemDef.effect.type,
              value: itemDef.effect.value,
              expiresAt: now + itemDef.effect.durationSeconds! * 1000,
            },
          ]);
          setTimeout(() => {
            toast({ title: `${itemDef.name} Activated!`, description: `${itemDef.description}`, duration: itemDef.effect.durationSeconds! * 1000 });
          },0);
        }
        break;
    }
  }, [inventory, toast]);


  const { totalIncomePerSecond, totalUpkeepPerSecond } = useMemo(() => {
    let baseIncome = 0;
    let baseUpkeep = 0;

    Object.values(hiredEmployees).forEach(hiredEmp => {
      const def = AVAILABLE_EMPLOYEES.find(e => e.id === hiredEmp.id);
      if (def) {
        let employeeIncome = def.incomePerSecond * hiredEmp.quantity;
        let employeeUpkeep = def.upkeepPerSecond * hiredEmp.quantity;

        // Apply employee-specific permanent artifice effects
        Object.values(acquiredArtifices).forEach(artifice => {
            const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
            if (artificeDef?.effect.type === "EMPLOYEE_SPECIFIC_INCOME_MULTIPLIER" && artificeDef.effect.employeeId === def.id) {
                employeeIncome *= artificeDef.effect.value;
            }
            if (artificeDef?.effect.type === "EMPLOYEE_SPECIFIC_UPKEEP_REDUCTION_MULTIPLIER" && artificeDef.effect.employeeId === def.id) {
                employeeUpkeep *= artificeDef.effect.value;
            }
        });
        baseIncome += employeeIncome;
        baseUpkeep += employeeUpkeep;
      }
    });

    let incomeWithTemporaryBuffs = baseIncome;
    let upkeepWithTemporaryBuffs = baseUpkeep;

    // Apply temporary buffs (from items)
    const now = Date.now();
    activeBuffs.forEach(buff => {
      if (now < buff.expiresAt) {
        if (buff.effectType === "INCOME_MULTIPLIER") {
          incomeWithTemporaryBuffs *= buff.value;
        } else if (buff.effectType === "UPKEEP_MULTIPLIER") {
          upkeepWithTemporaryBuffs *= buff.value;
        }
      }
    });
    
    let finalIncome = incomeWithTemporaryBuffs;
    let finalUpkeep = upkeepWithTemporaryBuffs;

    // Apply global permanent artifice effects
    Object.values(acquiredArtifices).forEach(artifice => {
        const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
        if (artificeDef?.effect.type === "GLOBAL_INCOME_MULTIPLIER") {
            finalIncome *= artificeDef.effect.value;
        }
        if (artificeDef?.effect.type === "GLOBAL_UPKEEP_REDUCTION_MULTIPLIER") {
            finalUpkeep *= artificeDef.effect.value;
        }
    });


    return { totalIncomePerSecond: finalIncome, totalUpkeepPerSecond: finalUpkeep };
  }, [hiredEmployees, activeBuffs, acquiredArtifices]);

  useEffect(() => {
    if (isGameOver || !gameInitialized) return;

    const gameLoop = setInterval(() => {
      // Item Drop Logic
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

      setBalance(prevBalance => {
        const netChange = totalIncomePerSecond - totalUpkeepPerSecond;
        const newBalance = prevBalance + netChange;

        if (newBalance < 0 && ( (Object.keys(hiredEmployees).length > 0 && totalIncomePerSecond <= totalUpkeepPerSecond) || (Object.keys(hiredEmployees).length === 0 && totalIncomePerSecond === 0 && prevBalance <=0) ) ) {
          setIsGameOver(true);
          setTimeout(() => {
            toast({
              title: "Game Over!",
              description: "Your agency went bankrupt. Reset to try again.",
              variant: "destructive",
              duration: Infinity,
            });
          }, 0);
          clearInterval(gameLoop); 
          return 0; 
        }
        return newBalance;
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [totalIncomePerSecond, totalUpkeepPerSecond, isGameOver, hiredEmployees, gameInitialized, toast, addItemToInventory, activeBuffs, acquiredArtifices, addArtificeToCollection]);


  const hireEmployee = useCallback((employeeId: string) => {
    if (isGameOver) return;

    const employeeDef = AVAILABLE_EMPLOYEES.find(emp => emp.id === employeeId);
    if (!employeeDef) {
      setTimeout(() => {
        toast({ title: "Error", description: "Employee definition not found.", variant: "destructive" });
      }, 0);
      return;
    }

    const numCurrentlyHired = hiredEmployees[employeeId]?.quantity || 0;
    let actualHireCost = calculateExponentialHireCost(employeeDef.baseHireCost, numCurrentlyHired);

    // Apply artifice cost reductions
    Object.values(acquiredArtifices).forEach(artifice => {
      const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
      if (artificeDef) {
        if (artificeDef.effect.type === "ALL_EMPLOYEES_HIRE_COST_MULTIPLIER") {
          actualHireCost *= artificeDef.effect.value;
        }
        if (artificeDef.effect.type === "SPECIFIC_EMPLOYEE_HIRE_COST_MULTIPLIER" && artificeDef.effect.employeeId === employeeId) {
          actualHireCost *= artificeDef.effect.value;
        }
      }
    });


    if (balance >= actualHireCost) {
      setBalance(prev => prev - actualHireCost);
      setHiredEmployees(prev => {
        const newHired = { ...prev };
        if (newHired[employeeId]) {
          newHired[employeeId].quantity += 1;
        } else {
          newHired[employeeId] = { id: employeeId, quantity: 1 };
        }
        return newHired;
      });
      setTimeout(() => {
        toast({
          title: "Employee Hired!",
          description: `You hired a ${employeeDef.name} for $${actualHireCost.toFixed(0)}.`,
        });
      },0);
    } else {
      setTimeout(() => {
        toast({
          title: "Insufficient Funds",
          description: `Not enough balance to hire ${employeeDef.name}. Need $${actualHireCost.toFixed(0)}, have $${balance.toFixed(0)}.`,
          variant: "destructive",
        });
      },0);
    }
  }, [balance, isGameOver, toast, hiredEmployees, acquiredArtifices]);


  const contextValue = useMemo(() => ({
    balance,
    setBalance,
    hiredEmployees,
    hireEmployee,
    totalIncomePerSecond,
    totalUpkeepPerSecond,
    isGameOver,
    resetGame,
    gameInitialized,
    inventory,
    addItemToInventory,
    useItem,
    activeBuffs,
    acquiredArtifices
  }), [balance, hiredEmployees, totalIncomePerSecond, totalUpkeepPerSecond, isGameOver, resetGame, gameInitialized, inventory, addItemToInventory, useItem, activeBuffs, acquiredArtifices, hireEmployee]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
