
import type { LucideIcon } from "lucide-react";

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
  | { type: "POINTS"; value: number }
  | { type: "ITEM"; itemId: string; quantity: number };

export interface GameStateSnapshot {
  points: number;
  purchasedUpgrades: Record<string, PurchasedUpgrade>;
  inventory: Record<string, InventoryItem>;
  acquiredArtifices: Record<string, AcquiredArtifice>;
  totalManualClicks: number;
  legacyTokens: number;
  purchasedPrestigeUpgrades: Record<string, PurchasedPrestigeUpgrade>;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  condition: (gameSnapshot: GameStateSnapshot) => boolean;
  reward: AchievementRewardType;
}

export interface AcquiredAchievement {
  achievementId: string;
  acquiredAt: number;
}

export type PrestigeUpgradeEffectType =
  | "GLOBAL_PPS_BOOST_PRESTIGE"
  | "GLOBAL_PPC_BOOST_PRESTIGE";

export interface PrestigeUpgradeEffect_GlobalPPS {
  type: "GLOBAL_PPS_BOOST_PRESTIGE";
  value: number; // e.g., 0.10 for +10%
}

export interface PrestigeUpgradeEffect_GlobalPPC {
  type: "GLOBAL_PPC_BOOST_PRESTIGE";
  value: number; // e.g., 0.05 for +5%
}

export type PrestigeUpgradeEffect =
  | PrestigeUpgradeEffect_GlobalPPS
  | PrestigeUpgradeEffect_GlobalPPC;

export interface PrestigeUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  cost: number; // Cost in Legacy Tokens
  effect: PrestigeUpgradeEffect;
  maxLevel?: number; // Optional: if upgrades can be leveled up
}

export interface PurchasedPrestigeUpgrade {
  id: string;
  level: number; // Current level of the upgrade
}

export type PurchaseMultiplier = 1 | 5 | 10 | 25 | 50 | 100 | 1000 | 10000 | 100000 | 1000000 | "MAX";


export interface GameContextType {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  purchasedUpgrades: Record<string, PurchasedUpgrade>;
  purchaseUpgrade: (upgradeId: string, multiplier: PurchaseMultiplier) => void;
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
  acquiredAchievements: Record<string, AcquiredAchievement>;
  totalManualClicks: number;
  legacyTokens: number;
  purchasedPrestigeUpgrades: Record<string, PurchasedPrestigeUpgrade>;
  prestigeGame: () => void;
  purchasePrestigeUpgrade: (upgradeId: string) => void;
  purchaseMultiplier: PurchaseMultiplier;
  setPurchaseMultiplier: React.Dispatch<React.SetStateAction<PurchaseMultiplier>>;
}
