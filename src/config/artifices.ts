
import type { ArtificeDefinition } from "@/lib/types";
import { Gem, Award, Sparkles, Target, DollarSignIcon, Zap } from "lucide-react"; // Added Zap

export const AVAILABLE_ARTIFICES: ArtificeDefinition[] = [
  {
    id: "eternal_growth_gem",
    name: "Eternal Growth Gem",
    description: "A pulsating gem that hums with untapped potential.",
    effectDescription: "+5% to all Points Per Second (PPS) permanently.",
    icon: Gem,
    effect: {
      type: "GLOBAL_PPS_MULTIPLIER",
      value: 1.05,
    },
  },
  {
    id: "click_power_crystal",
    name: "Crystal of a Thousand Clicks",
    description: "Empowers each of your manual clicks.",
    effectDescription: "+10% to Points Per Click permanently.",
    icon: Zap, // Using Zap for click power
    effect: {
      type: "GLOBAL_CLICK_POWER_MULTIPLIER",
      value: 1.10,
    },
  },
  {
    id: "harvester_efficiency_core",
    name: "Efficiency Core (Auto Harvester)",
    description: "Boosts the effectiveness of your Auto Harvesters.",
    effectDescription: "+10% PPS from Auto Harvesters permanently.",
    icon: Sparkles,
    effect: {
      type: "UPGRADE_SPECIFIC_PPS_MULTIPLIER",
      upgradeId: "auto_harvester",
      value: 1.10,
    },
  },
  {
    id: "golden_contract",
    name: "Golden Contract",
    description: "Makes acquiring new upgrades slightly more affordable.",
    effectDescription: "-5% to base cost for all upgrades permanently.",
    icon: Award, // Changed from DollarSignIcon
    effect: {
      type: "ALL_UPGRADES_COST_MULTIPLIER",
      value: 0.95,
    },
  },
  {
    id: "quantum_discount_module",
    name: "Discount Module (Quantum Computer)",
    description: "Reduces the cost of Quantum Computers.",
    effectDescription: "-10% to base cost for Quantum Computers permanently.",
    icon: Target, // Using Target as a generic one
    effect: {
      type: "SPECIFIC_UPGRADE_COST_MULTIPLIER",
      upgradeId: "quantum_computer",
      value: 0.90,
    },
  }
];
