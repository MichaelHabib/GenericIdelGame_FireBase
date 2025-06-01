
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { GameContextType, HiredEmployee, InventoryItem, ActiveBuff, ItemEffectType } from "@/lib/types";
import { AVAILABLE_EMPLOYEES, INITIAL_BALANCE, calculateExponentialHireCost } from "@/config/employees";
import { AVAILABLE_ITEMS } from "@/config/items";
import { useToast } from "@/hooks/use-toast";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [hiredEmployees, setHiredEmployees] = useState<Record<string, HiredEmployee>>({});
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const { toast } = useToast();

  const resetGame = useCallback(() => {
    setBalance(INITIAL_BALANCE);
    setHiredEmployees({});
    setInventory({});
    setActiveBuffs([]);
    setIsGameOver(false);
    setGameInitialized(true);
    toast({ title: "Game Reset", description: "Started a new marketing empire!" });
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
      const maxQuantity = itemDef.maxQuantity ?? Infinity;
      
      if (currentQuantity >= maxQuantity) {
        toast({
          title: "Inventory Full",
          description: `You already have the maximum amount of ${itemDef.name}.`,
          variant: "default",
        });
        return prevInventory;
      }

      const newQuantity = Math.min(currentQuantity + quantity, maxQuantity);
      
      toast({
        title: "Item Acquired!",
        description: `You found: ${itemDef.name}!`,
      });
      return {
        ...prevInventory,
        [itemId]: { itemId, quantity: newQuantity },
      };
    });
  }, [toast]);
  
  const useItem = useCallback((itemId: string) => {
    const itemDef = AVAILABLE_ITEMS.find(item => item.id === itemId);
    const inventoryItem = inventory[itemId];

    if (!itemDef || !inventoryItem || inventoryItem.quantity <= 0) {
      toast({ title: "Item Error", description: "Cannot use this item.", variant: "destructive" });
      return;
    }

    // Consume item
    setInventory(prev => {
      const newInventory = { ...prev };
      if (newInventory[itemId].quantity > 1) {
        newInventory[itemId].quantity -= 1;
      } else {
        delete newInventory[itemId];
      }
      return newInventory;
    });

    // Apply effect
    const now = Date.now();
    switch (itemDef.effect.type) {
      case "INSTANT_BALANCE":
        setBalance(prev => prev + itemDef.effect.value);
        toast({ title: `${itemDef.name} Used!`, description: `Gained $${itemDef.effect.value.toFixed(0)}!` });
        break;
      case "INCOME_MULTIPLIER":
      case "UPKEEP_MULTIPLIER":
        if (itemDef.effect.durationSeconds) {
          // Remove existing buff of the same type before adding new one to prevent weird stacking
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
          toast({ title: `${itemDef.name} Activated!`, description: `${itemDef.description}`, duration: itemDef.effect.durationSeconds! * 1000 });
        }
        break;
    }
  }, [inventory, toast]);


  const { totalIncomePerSecond, totalUpkeepPerSecond } = useMemo(() => {
    let income = 0;
    let upkeep = 0;

    Object.values(hiredEmployees).forEach(hiredEmp => {
      const def = AVAILABLE_EMPLOYEES.find(e => e.id === hiredEmp.id);
      if (def) {
        income += def.incomePerSecond * hiredEmp.quantity;
        upkeep += def.upkeepPerSecond * hiredEmp.quantity;
      }
    });

    // Apply buffs
    const now = Date.now();
    activeBuffs.forEach(buff => {
      if (now < buff.expiresAt) {
        if (buff.effectType === "INCOME_MULTIPLIER") {
          income *= buff.value;
        } else if (buff.effectType === "UPKEEP_MULTIPLIER") {
          upkeep *= buff.value;
        }
      }
    });

    return { totalIncomePerSecond: income, totalUpkeepPerSecond: upkeep };
  }, [hiredEmployees, activeBuffs]);

  useEffect(() => {
    if (isGameOver || !gameInitialized) return;

    const gameLoop = setInterval(() => {
      // Item Drop Logic (10% chance per second)
      if (Math.random() < 0.10) { // 10% chance
        const availableToDrop = AVAILABLE_ITEMS; // Can be filtered later based on game progress
        if (availableToDrop.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableToDrop.length);
          addItemToInventory(availableToDrop[randomIndex].id);
        }
      }
      
      // Buff Expiry Logic
      const now = Date.now();
      const activeBuffsStillActive = activeBuffs.filter(buff => {
        if (now >= buff.expiresAt) {
          const itemDef = AVAILABLE_ITEMS.find(item => item.id === buff.itemId);
          toast({ title: "Buff Expired", description: `${itemDef?.name || 'A buff'} has worn off.` });
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

        if (newBalance < 0 && ( (Object.keys(hiredEmployees).length > 0 && totalIncomePerSecond <= totalUpkeepPerSecond) || (Object.keys(hiredEmployees).length === 0 && totalIncomePerSecond === 0) ) ) {
          setIsGameOver(true);
          toast({
            title: "Game Over!",
            description: "Your agency went bankrupt. Reset to try again.",
            variant: "destructive",
            duration: Infinity,
          });
          clearInterval(gameLoop); // Stop the loop
          return 0; // Or newBalance, depending on if you want to show negative then game over
        }
        return newBalance;
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [totalIncomePerSecond, totalUpkeepPerSecond, isGameOver, hiredEmployees, gameInitialized, toast, addItemToInventory, activeBuffs]);


  const hireEmployee = useCallback((employeeId: string) => {
    if (isGameOver) return;

    const employeeDef = AVAILABLE_EMPLOYEES.find(emp => emp.id === employeeId);
    if (!employeeDef) {
      toast({ title: "Error", description: "Employee definition not found.", variant: "destructive" });
      return;
    }

    const numCurrentlyHired = hiredEmployees[employeeId]?.quantity || 0;
    const actualHireCost = calculateExponentialHireCost(employeeDef.baseHireCost, numCurrentlyHired);

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
      toast({
        title: "Employee Hired!",
        description: `You hired a ${employeeDef.name} for $${actualHireCost.toFixed(0)}.`,
      });
    } else {
      toast({
        title: "Insufficient Funds",
        description: `Not enough balance to hire ${employeeDef.name}. Need $${actualHireCost.toFixed(0)}, have $${balance.toFixed(0)}.`,
        variant: "destructive",
      });
    }
  }, [balance, isGameOver, toast, hiredEmployees]);


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
    activeBuffs
  }), [balance, hiredEmployees, totalIncomePerSecond, totalUpkeepPerSecond, isGameOver, resetGame, gameInitialized, inventory, addItemToInventory, useItem, activeBuffs, hireEmployee]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
