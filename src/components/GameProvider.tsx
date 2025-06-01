
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { GameContextType, HiredEmployee } from "@/lib/types";
import { AVAILABLE_EMPLOYEES, INITIAL_BALANCE, calculateExponentialHireCost } from "@/config/employees";
import { useToast } from "@/hooks/use-toast";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [hiredEmployees, setHiredEmployees] = useState<Record<string, HiredEmployee>>({});
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const { toast } = useToast();

  const resetGame = useCallback(() => {
    setBalance(INITIAL_BALANCE);
    setHiredEmployees({});
    setIsGameOver(false);
    setGameInitialized(true); 
    toast({ title: "Game Reset", description: "Started a new marketing empire!" });
  }, [toast]);
  
  useEffect(() => {
    if (!gameInitialized) {
      resetGame();
    }
  }, [gameInitialized, resetGame]);


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
    return { totalIncomePerSecond: income, totalUpkeepPerSecond: upkeep };
  }, [hiredEmployees]);

  useEffect(() => {
    if (isGameOver || !gameInitialized) return;

    const gameLoop = setInterval(() => {
      setBalance(prevBalance => {
        const netChange = totalIncomePerSecond - totalUpkeepPerSecond;
        const newBalance = prevBalance + netChange;
        
        if (newBalance < 0 && Object.keys(hiredEmployees).length > 0 && totalIncomePerSecond <= totalUpkeepPerSecond) {
            setIsGameOver(true);
            toast({
                title: "Game Over!",
                description: "Your agency went bankrupt. Reset to try again.",
                variant: "destructive",
                duration: Infinity
            });
            clearInterval(gameLoop);
            return 0; 
        } else if (newBalance < 0 && Object.keys(hiredEmployees).length === 0) {
            setIsGameOver(true);
            toast({
                title: "Game Over!",
                description: "Your agency is out of funds with no income. Reset to try again.",
                variant: "destructive",
                duration: Infinity
            });
            clearInterval(gameLoop);
            return 0;
        }
        return newBalance;
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [totalIncomePerSecond, totalUpkeepPerSecond, isGameOver, hiredEmployees, gameInitialized, toast]);


  const contextValue = useMemo(() => ({
    balance,
    setBalance,
    hiredEmployees,
    hireEmployee,
    totalIncomePerSecond,
    totalUpkeepPerSecond,
    isGameOver,
    resetGame,
    gameInitialized
  }), [balance, setBalance, hiredEmployees, hireEmployee, totalIncomePerSecond, totalUpkeepPerSecond, isGameOver, resetGame, gameInitialized]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
