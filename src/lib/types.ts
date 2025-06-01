
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
    value: number; 
    durationSeconds?: number; 
  };
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

export type ArtificeEffectTypePermanent = 
  | "GLOBAL_INCOME_MULTIPLIER"
  | "GLOBAL_UPKEEP_REDUCTION_MULTIPLIER"
  | "EMPLOYEE_SPECIFIC_INCOME_MULTIPLIER"
  | "EMPLOYEE_SPECIFIC_UPKEEP_REDUCTION_MULTIPLIER"
  | "ALL_EMPLOYEES_HIRE_COST_MULTIPLIER"
  | "SPECIFIC_EMPLOYEE_HIRE_COST_MULTIPLIER";

export interface ArtificeEffect_GlobalIncomeMultiplier {
  type: "GLOBAL_INCOME_MULTIPLIER";
  value: number; // e.g., 1.05 for +5%
}
export interface ArtificeEffect_GlobalUpkeepReductionMultiplier {
  type: "GLOBAL_UPKEEP_REDUCTION_MULTIPLIER";
  value: number; // e.g., 0.95 for -5%
}
export interface ArtificeEffect_EmployeeSpecificIncomeMultiplier {
  type: "EMPLOYEE_SPECIFIC_INCOME_MULTIPLIER";
  employeeId: string;
  value: number;
}
export interface ArtificeEffect_EmployeeSpecificUpkeepReductionMultiplier {
  type: "EMPLOYEE_SPECIFIC_UPKEEP_REDUCTION_MULTIPLIER";
  employeeId: string;
  value: number;
}
export interface ArtificeEffect_AllEmployeesHireCostMultiplier {
  type: "ALL_EMPLOYEES_HIRE_COST_MULTIPLIER";
  value: number; // e.g. 0.9 for 10% cheaper
}

export interface ArtificeEffect_SpecificEmployeeHireCostMultiplier {
  type: "SPECIFIC_EMPLOYEE_HIRE_COST_MULTIPLIER";
  employeeId: string;
  value: number; // e.g. 0.9 for 10% cheaper for this employee
}


export type ArtificeEffectPermanent = 
  | ArtificeEffect_GlobalIncomeMultiplier
  | ArtificeEffect_GlobalUpkeepReductionMultiplier
  | ArtificeEffect_EmployeeSpecificIncomeMultiplier
  | ArtificeEffect_EmployeeSpecificUpkeepReductionMultiplier
  | ArtificeEffect_AllEmployeesHireCostMultiplier
  | ArtificeEffect_SpecificEmployeeHireCostMultiplier;


export interface ArtificeDefinition {
  id: string;
  name: string;
  description: string; // General description of the artifice
  effectDescription: string; // Specific description of its effect (e.g., "+5% to all income")
  icon: LucideIcon;
  effect: ArtificeEffectPermanent;
}

export interface AcquiredArtifice {
  artificeId: string;
  acquiredAt: number; // Timestamp
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
  acquiredArtifices: Record<string, AcquiredArtifice>;
  // addArtificeToCollection: (artificeId: string) => void; // Added internally in GameProvider
}
