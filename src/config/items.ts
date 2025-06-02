
import type { ItemDefinition } from "@/lib/types";
import { Gift, Zap, ShieldCheck, CoffeeIcon, TrendingUp, TrendingDown } from "lucide-react";

export const AVAILABLE_ITEMS: ItemDefinition[] = [
  {
    id: "quick_points",
    name: "Quick Points Grant",
    description: "A small grant to boost your points instantly.",
    icon: Gift,
    effect: {
      type: "INSTANT_POINTS",
      value: 150,
    },
  },
  {
    id: "pps_boost_coffee",
    name: "PPS Boost Coffee",
    description: "Boosts all PPS by 20% for 30 seconds.",
    icon: CoffeeIcon,
    effect: {
      type: "PPS_MULTIPLIER",
      value: 1.2, // 20% increase
      durationSeconds: 30,
    },
  },
   {
    id: "market_frenzy",
    name: "Market Frenzy Elixir",
    description: "Temporarily doubles PPS from all sources for 20 seconds.",
    icon: TrendingUp,
    effect: {
      type: "PPS_MULTIPLIER",
      value: 2.0,
      durationSeconds: 20,
    },
  },
  // Removed upkeep related items as upkeep is removed from core spec
  // {
  //   id: "efficiency_seminar",
  //   name: "Efficiency Seminar Pass",
  //   description: "Reduces all employee upkeep by 15% for 60 seconds.",
  //   icon: ShieldCheck,
  //   effect: {
  //     type: "UPKEEP_MULTIPLIER",
  //     value: 0.85,
  //     durationSeconds: 60,
  //   },
  // },
  // {
  //   id: "cost_cutting_expert",
  //   name: "Cost-Cutting Expert Advice",
  //   description: "Halves all upkeep costs for 45 seconds.",
  //   icon: TrendingDown,
  //   effect: {
  //     type: "UPKEEP_MULTIPLIER",
  //     value: 0.5,
  //     durationSeconds: 45,
  //   },
  // }
];
