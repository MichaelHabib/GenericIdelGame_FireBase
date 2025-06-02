
import type { UpgradeDefinition } from "@/lib/types";
import { MousePointerClick, Server, Zap, Brain, Rocket, Gem, Star, Hourglass, Atom } from "lucide-react";

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
  }
];

// quantity is the number of this specific upgrade type ALREADY PURCHASED
export const calculateExponentialUpgradeCost = (baseCost: number, quantity: number): number => {
 return baseCost * Math.pow(1.15, quantity);
};
