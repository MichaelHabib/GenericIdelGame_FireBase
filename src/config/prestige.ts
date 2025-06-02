
import type { PrestigeUpgradeDefinition } from "@/lib/types";
import { Gem, Zap, TrendingUp, Award, Shield } from "lucide-react";

export const AVAILABLE_PRESTIGE_UPGRADES: PrestigeUpgradeDefinition[] = [
  {
    id: "prestige_pps_boost_1",
    name: "Legacy Power I",
    description: "Permanently increases all Points Per Second (PPS) by 10%.",
    icon: TrendingUp,
    cost: 5,
    effect: { type: "GLOBAL_PPS_BOOST_PRESTIGE", value: 0.10 },
    maxLevel: 5, // Example: Can be purchased 5 times
  },
  {
    id: "prestige_ppc_boost_1",
    name: "Ancient Click I",
    description: "Permanently increases all Points Per Click (PPC) by 20%.",
    icon: Zap,
    cost: 3,
    effect: { type: "GLOBAL_PPC_BOOST_PRESTIGE", value: 0.20 },
    maxLevel: 5,
  },
  {
    id: "prestige_starting_points",
    name: "Head Start",
    description: "Start with 1,000 points after prestiging (bonus applied once). This effect does not stack with itself but is reapplied after each prestige.",
    icon: Award, // Using Award icon for a starting bonus
    cost: 10,
    effect: { type: "GLOBAL_PPS_BOOST_PRESTIGE", value: 0 }, // No direct PPS/PPC, handled in prestige logic
    // This effect would be specially handled in the prestigeGame function
  },
   {
    id: "prestige_artifice_chance",
    name: "Artifice Attunement",
    description: "Slightly increases the chance of finding Artifices.",
    icon: Gem, 
    cost: 15,
    effect: { type: "GLOBAL_PPS_BOOST_PRESTIGE", value: 0 }, // Placeholder, actual effect in GameProvider
    maxLevel: 3,
  },
  {
    id: "prestige_cheaper_upgrades",
    name: "Economic Insight",
    description: "Reduces the cost of all regular upgrades by 2% per level.",
    icon: Shield, // Using Shield for cost reduction/defense
    cost: 20,
    effect: { type: "GLOBAL_PPS_BOOST_PRESTIGE", value: 0 }, // Placeholder, actual effect in GameProvider
    maxLevel: 5,
  },
];
