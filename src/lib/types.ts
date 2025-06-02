
import type { LucideIcon } from "lucide-react";

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  baseCost: number;
  ppsPerUnit: number; // Points Per Second per unit
  // upkeepPerSecond removed as per new spec
}

export interface PurchasedUpgrade {
  id: string; // Corresponds to UpgradeDefinition id
  quantity: number;
}

export type ItemEffectType = "INSTANT_POINTS" | "PPS_MULTIPLIER"; // Simplified for clicker

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

// Artifice types remain largely the same, but effects might target PPS or click power
export type ArtificeEffectTypePermanent =
  | "GLOBAL_PPS_MULTIPLIER"
  | "GLOBAL_CLICK_POWER_MULTIPLIER" // New: for click button
  | "UPGRADE_SPECIFIC_PPS_MULTIPLIER"
  | "ALL_UPGRADES_COST_MULTIPLIER"
  | "SPECIFIC_UPGRADE_COST_MULTIPLIER";

export interface ArtificeEffect_GlobalPPSMultiplier {
  type: "GLOBAL_PPS_MULTIPLIER";
  value: number; // e.g., 1.05 for +5%
}
export interface ArtificeEffect_GlobalClickPowerMultiplier {
  type: "GLOBAL_CLICK_POWER_MULTIPLIER";
  value: number; // e.g., 1.1 for +10% click power
}
export interface ArtificeEffect_UpgradeSpecificPPSMultiplier {
  type: "UPGRADE_SPECIFIC_PPS_MULTIPLIER";
  upgradeId: string;
  value: number;
}
export interface ArtificeEffect_AllUpgradesCostMultiplier {
  type: "ALL_UPGRADES_COST_MULTIPLIER";
  value: number; // e.g. 0.9 for 10% cheaper
}
export interface ArtificeEffect_SpecificUpgradeCostMultiplier {
  type: "SPECIFIC_UPGRADE_COST_MULTIPLIER";
  upgradeId: string;
  value: number; // e.g. 0.9 for 10% cheaper for this upgrade
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
  acquiredAt: number; // Timestamp
}

export interface GameContextType {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  purchasedUpgrades: Record<string, PurchasedUpgrade>;
  purchaseUpgrade: (upgradeId: string) => void;
  clickMasterButton: () => void; // New for main click action
  pointsPerClick: number;
  totalPointsPerSecond: number;
  // isGameOver removed
  resetGame: () => void;
  gameInitialized: boolean;
  inventory: Record<string, InventoryItem>;
  addItemToInventory: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => void;
  activeBuffs: ActiveBuff[];
  acquiredArtifices: Record<string, AcquiredArtifice>;
}
