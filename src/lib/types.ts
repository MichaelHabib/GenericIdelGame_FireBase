
import type { LucideIcon } from "lucide-react";
import type { GameContextType as FullGameContextType } from "./types"; // Self-reference for condition

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  baseCost: number;
  ppsPerUnit: number;
}

export interface PurchasedUpgrade {
  id: string;
  quantity: number;
}

export type ItemEffectType = "INSTANT_POINTS" | "PPS_MULTIPLIER";

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
  expiresAt: number;
}

export type ArtificeEffectTypePermanent =
  | "GLOBAL_PPS_MULTIPLIER"
  | "GLOBAL_CLICK_POWER_MULTIPLIER"
  | "UPGRADE_SPECIFIC_PPS_MULTIPLIER"
  | "ALL_UPGRADES_COST_MULTIPLIER"
  | "SPECIFIC_UPGRADE_COST_MULTIPLIER";

export interface ArtificeEffect_GlobalPPSMultiplier {
  type: "GLOBAL_PPS_MULTIPLIER";
  value: number;
}
export interface ArtificeEffect_GlobalClickPowerMultiplier {
  type: "GLOBAL_CLICK_POWER_MULTIPLIER";
  value: number;
}
export interface ArtificeEffect_UpgradeSpecificPPSMultiplier {
  type: "UPGRADE_SPECIFIC_PPS_MULTIPLIER";
  upgradeId: string;
  value: number;
}
export interface ArtificeEffect_AllUpgradesCostMultiplier {
  type: "ALL_UPGRADES_COST_MULTIPLIER";
  value: number;
}
export interface ArtificeEffect_SpecificUpgradeCostMultiplier {
  type: "SPECIFIC_UPGRADE_COST_MULTIPLIER";
  upgradeId: string;
  value: number;
}

export type ArtificeEffectPermanent =
  | ArtificeEffect_GlobalPPSMultiplier
  | ArtificeEffect_GlobalClickPowerMultiplier
  | ArtificeEffect_UpgradeSpecificPPSMultiplier
  | ArtificeEffect_AllUpgradesCostMultiplier
  | ArtificeEffect_SpecificUpgradeCostMultiplier;

export interface ArtificeDefinition {
  id: string;
  name: string;
  description: string;
  effectDescription: string;
  icon: LucideIcon;
  effect: ArtificeEffectPermanent;
}

export interface AcquiredArtifice {
  artificeId: string;
  acquiredAt: number;
}

export type AchievementRewardType = 
  | { type: 'POINTS'; value: number; }
  | { type: 'ITEM'; itemId: string; quantity: number; };

// Forward declare GameContextType for achievement condition
// This avoids circular dependency if GameContextType itself needs Achievement types
interface BaseGameStateType {
  points: number;
  purchasedUpgrades: Record<string, PurchasedUpgrade>;
  inventory: Record<string, InventoryItem>;
  activeBuffs: ActiveBuff[];
  acquiredArtifices: Record<string, AcquiredArtifice>;
  // Potentially add more minimal fields if achievements need them directly and GameContextType becomes too large
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  // condition now takes a snapshot of game state and specific tracked values
  condition: (gameSnapshot: {
    points: number;
    purchasedUpgrades: Record<string, PurchasedUpgrade>;
    inventory: Record<string, InventoryItem>;
    acquiredArtifices: Record<string, AcquiredArtifice>;
    totalManualClicks: number;
    // Add other relevant snapshot data here as needed
  }) => boolean;
  reward: AchievementRewardType;
}

export interface AcquiredAchievement {
  achievementId: string;
  acquiredAt: number; // Timestamp
}

export interface GameContextType {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  purchasedUpgrades: Record<string, PurchasedUpgrade>;
  purchaseUpgrade: (upgradeId: string) => void;
  clickMasterButton: () => void;
  pointsPerClick: number;
  totalPointsPerSecond: number;
  resetGame: () => void;
  gameInitialized: boolean;
  inventory: Record<string, InventoryItem>;
  addItemToInventory: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => void;
  activeBuffs: ActiveBuff[];
  acquiredArtifices: Record<string, AcquiredArtifice>;
  acquiredAchievements: Record<string, AcquiredAchievement>; // Added
  totalManualClicks: number; // Added for achievement tracking
}
