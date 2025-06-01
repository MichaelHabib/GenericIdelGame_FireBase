
import type { ItemDefinition } from "@/lib/types";
import { Gift, Zap, ShieldCheck, CoffeeIcon, TrendingUp, TrendingDown } from "lucide-react"; // Assuming CoffeeIcon exists or use a different one like Mug

export const AVAILABLE_ITEMS: ItemDefinition[] = [
  {
    id: "quick_cash",
    name: "Quick Cash Grant",
    description: "A small grant to boost your funds instantly.",
    icon: Gift,
    effect: {
      type: "INSTANT_BALANCE",
      value: 150, // Grants $150
    },
    // maxQuantity: 5, - REMOVED
  },
  {
    id: "productivity_boost",
    name: "Productivity Coffee",
    description: "Boosts all employee income by 20% for 30 seconds.",
    icon: CoffeeIcon,
    effect: {
      type: "INCOME_MULTIPLIER",
      value: 1.2, // 20% increase
      durationSeconds: 30,
    },
    // maxQuantity: 3, - REMOVED
  },
  {
    id: "efficiency_seminar",
    name: "Efficiency Seminar Pass",
    description: "Reduces all employee upkeep by 15% for 60 seconds.",
    icon: ShieldCheck, // Using ShieldCheck as BookOpenCheck isn't standard
    effect: {
      type: "UPKEEP_MULTIPLIER",
      value: 0.85, // 15% decrease (1 - 0.15)
      durationSeconds: 60,
    },
    // maxQuantity: 3, - REMOVED
  },
   {
    id: "market_surge",
    name: "Market Surge",
    description: "Temporarily doubles income from all sources for 20 seconds.",
    icon: TrendingUp,
    effect: {
      type: "INCOME_MULTIPLIER",
      value: 2.0, 
      durationSeconds: 20,
    },
    // maxQuantity: 2, - REMOVED
  },
  {
    id: "cost_cutting_expert",
    name: "Cost-Cutting Expert Advice",
    description: "Halves all upkeep costs for 45 seconds.",
    icon: TrendingDown,
    effect: {
      type: "UPKEEP_MULTIPLIER",
      value: 0.5,
      durationSeconds: 45,
    },
    // maxQuantity: 2, - REMOVED
  }
];
