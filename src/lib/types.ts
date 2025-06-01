
import type { LucideIcon } from "lucide-react";

export interface EmployeeDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  baseHireCost: number; // Changed from hireCost to baseHireCost
  incomePerSecond: number;
  upkeepPerSecond: number;
}

export interface HiredEmployee {
  id: string; // Corresponds to EmployeeDefinition id
  quantity: number;
}

export interface GameContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  hiredEmployees: Record<string, HiredEmployee>;
  hireEmployee: (employeeId: string) => void;
  totalIncomePerSecond: number;
  totalUpkeepPerSecond: number;
  isGameOver: boolean;
  resetGame: () => void;
  gameInitialized: boolean;
}
