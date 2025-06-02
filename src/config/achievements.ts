
import type { AchievementDefinition, GameStateSnapshot } from "@/lib/types";
import { Award, DollarSign, HandMetal, Pointer, Rocket, Server, Sparkles, Target, Star } from "lucide-react"; // Added Star
import { AVAILABLE_UPGRADES } from "./upgrades";

export const AVAILABLE_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_click",
    name: "Baby Steps",
    description: "Make your first click.",
    icon: Pointer,
    condition: (gameSnapshot) => gameSnapshot.totalManualClicks >= 1,
    reward: { type: "POINTS", value: 5 },
  },
  {
    id: "click_enthusiast",
    name: "Click Enthusiast",
    description: "Click the button 100 times.",
    icon: HandMetal,
    condition: (gameSnapshot) => gameSnapshot.totalManualClicks >= 100,
    reward: { type: "ITEM", itemId: "quick_points", quantity: 1 },
  },
  {
    id: "point_novice",
    name: "Point Novice",
    description: "Earn 100 total points.",
    icon: DollarSign,
    condition: (gameSnapshot) => gameSnapshot.points >= 100,
    reward: { type: "POINTS", value: 20 },
  },
  {
    id: "point_adept",
    name: "Point Adept",
    description: "Earn 10,000 total points.",
    icon: Award,
    condition: (gameSnapshot) => gameSnapshot.points >= 10000,
    reward: { type: "POINTS", value: 250 },
  },
  {
    id: "harvester_owner",
    name: "First Harvester",
    description: "Buy your first Auto Harvester.",
    icon: Server,
    condition: (gameSnapshot) =>
      !!gameSnapshot.purchasedUpgrades["auto_harvester"] &&
      gameSnapshot.purchasedUpgrades["auto_harvester"].quantity >= 1,
    reward: { type: "POINTS", value: 50 },
  },
  {
    id: "many_harvesters",
    name: "Harvester Fleet",
    description: "Own 10 Auto Harvesters.",
    icon: Server,
    condition: (gameSnapshot) =>
      !!gameSnapshot.purchasedUpgrades["auto_harvester"] &&
      gameSnapshot.purchasedUpgrades["auto_harvester"].quantity >= 10,
    reward: { type: "ITEM", itemId: "pps_boost_coffee", quantity: 1 },
  },
  {
    id: "quantum_leap",
    name: "Quantum Leap",
    description: "Purchase a Quantum Computer.",
    icon: Rocket,
    condition: (gameSnapshot) =>
      !!gameSnapshot.purchasedUpgrades["quantum_computer"] &&
      gameSnapshot.purchasedUpgrades["quantum_computer"].quantity >= 1,
    reward: { type: "POINTS", value: 10000 },
  },
  {
    id: "artifice_collector",
    name: "Artifice Collector",
    description: "Acquire your first Artifice.",
    icon: Sparkles,
    condition: (gameSnapshot) => Object.keys(gameSnapshot.acquiredArtifices).length >= 1,
    reward: { type: "POINTS", value: 500 },
  },
   {
    id: "serious_investor",
    name: "Serious Investor",
    description: "Own at least one of every type of upgrade.",
    icon: Target,
    condition: (gameSnapshot) => {
      const allUpgradeIds = AVAILABLE_UPGRADES.map(upg => upg.id);
      return allUpgradeIds.every(id => gameSnapshot.purchasedUpgrades[id] && gameSnapshot.purchasedUpgrades[id].quantity > 0);
    },
    reward: { type: "POINTS", value: 20000 },
  },
  {
    id: "first_prestige",
    name: "Rebirth",
    description: "Prestige for the first time.",
    icon: Star, // Using Star for prestige
    condition: (gameSnapshot: GameStateSnapshot) => gameSnapshot.legacyTokens > 0 || (Object.keys(gameSnapshot.purchasedPrestigeUpgrades).length > 0), // A bit tricky to check *during* prestige, so check for tokens or purchased prestige upgrades
    reward: { type: "POINTS", value: 100000 }, // A point boost after first prestige
  },
];
