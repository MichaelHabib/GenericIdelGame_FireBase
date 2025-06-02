
import type { UpgradeDefinition } from "@/lib/types";
import { MousePointerClick, Server, Zap, Brain, Rocket, Gem, Star, Hourglass, Atom, Layers, Lightbulb, Factory } from "lucide-react";

export const AVAILABLE_UPGRADES: UpgradeDefinition[] = [
 {
    id: "basic_clicker",
    name: "Basic Clicker",
    description: "A simple script that clicks for you. Every little bit helps!",
    icon: MousePointerClick,
    baseCost: 10,
    ppsPerUnit: 0.1,
 },
 {
    id: "auto_harvester",
    name: "Auto Harvester",
    description: "Automatically gathers small amounts of points.",
    icon: Server,
    baseCost: 100,
    ppsPerUnit: 1,
 },
 {
    id: "point_synthesizer",
    name: "Point Synthesizer",
    description: "Generates points at a steady rate through advanced technology.",
    icon: Zap,
    baseCost: 1000,
    ppsPerUnit: 8,
 },
 {
    id: "neural_network",
    name: "Neural Network",
    description: "A complex AI that optimizes point generation strategies.",
    icon: Brain,
    baseCost: 10000,
    ppsPerUnit: 47,
 },
 {
    id: "quantum_computer",
    name: "Quantum Computer",
    description: "Performs calculations at unimaginable speeds to create points.",
    icon: Rocket,
    baseCost: 120000,
    ppsPerUnit: 260,
  },
  {
    id: "reality_bender",
    name: "Reality Bender",
    description: "Manipulates the fabric of spacetime to will points into existence.",
    icon: Gem,
    baseCost: 1500000, // 1.5M
    ppsPerUnit: 1400,
  },
  {
    id: "cosmic_forge",
    name: "Cosmic Forge",
    description: "Harnesses stellar energy to materialize vast quantities of points.",
    icon: Star,
    baseCost: 25000000, // 25M
    ppsPerUnit: 7500,
  },
  {
    id: "chroniton_field",
    name: "Chroniton Field",
    description: "Bends time itself to accelerate point accumulation across dimensions.",
    icon: Hourglass,
    baseCost: 300000000, // 300M
    ppsPerUnit: 50000,
  },
  {
    id: "singularity_engine",
    name: "Singularity Engine",
    description: "Taps into a micro-singularity for near-infinite point generation.",
    icon: Atom,
    baseCost: 5000000000, // 5B
    ppsPerUnit: 300000,
  },
  {
    id: "idea_incubator",
    name: "Idea Incubator",
    description: "Cultivates raw thoughts into tangible point-generating concepts.",
    icon: Lightbulb,
    baseCost: 75000000000, // 75B
    ppsPerUnit: 2000000, // 2M
  },
  {
    id: "dream_weaver",
    name: "Dream Weaver",
    description: "Manifests points directly from the collective unconscious.",
    icon: Layers,
    baseCost: 1000000000000, // 1T
    ppsPerUnit: 15000000, // 15M
  },
  {
    id: "point_fabricator",
    name: "Point Fabricator Prime",
    description: "A massive, automated factory dedicated to point production.",
    icon: Factory,
    baseCost: 15000000000000, // 15T
    ppsPerUnit: 100000000, // 100M
  }
];

// quantity is the number of this specific upgrade type ALREADY PURCHASED
export const calculateExponentialUpgradeCost = (baseCost: number, quantity: number): number => {
 return baseCost * Math.pow(1.15, quantity);
};

export const calculateTotalCostForQuantity = (
  baseCost: number,
  currentOwned: number,
  quantityToBuy: number
): number => {
  let totalCost = 0;
  for (let i = 0; i < quantityToBuy; i++) {
    totalCost += calculateExponentialUpgradeCost(baseCost, currentOwned + i);
  }
  return totalCost;
};

export const calculateMaxAffordable = (
  baseCost: number,
  currentOwned: number,
  currentPoints: number
): { quantity: number; totalCost: number } => {
  let quantity = 0;
  let totalCost = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const nextCost = calculateExponentialUpgradeCost(baseCost, currentOwned + quantity);
    if (currentPoints >= totalCost + nextCost) {
      totalCost += nextCost;
      quantity++;
    } else {
      break;
    }
    // Safety break for very low costs / high points to prevent infinite loops in extreme scenarios
    if (quantity > 1000000) break; 
  }
  return { quantity, totalCost };
};
