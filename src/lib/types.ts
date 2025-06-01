
import type { LucideIcon } from "lucide-react";

export interface EmployeeDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  baseHireCost: number;
  incomePerSecond: number;
  upkeepPerSecond: number;
}

export interface HiredEmployee {
  id: string; // Corresponds to EmployeeDefinition id
  quantity: number;
}

export type ItemEffectType = "INSTANT_BALANCE" | "INCOME_MULTIPLIER" | "UPKEEP_MULTIPLIER";

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  effect: {
    type: ItemEffectType;
    value: number; // e.g., amount for INSTANT_BALANCE, multiplier (1.2 for +20%) for others
    durationSeconds?: number; // Only for timed effects
  };
  maxQuantity?: number; // Optional: Max of this item a player can hold
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface ActiveBuff {
  itemId: string;
  effectType: ItemEffectType;
  value: number;
  expiresAt: number; // Timestamp
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
  inventory: Record<string, InventoryItem>;
  addItemToInventory: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => void;
  activeBuffs: ActiveBuff[];
}
