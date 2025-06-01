
import type { ArtificeDefinition } from "@/lib/types";
import { Gem, Award, Sparkles, TrendingUpIcon, ShieldHalf, DollarSignIcon } from "lucide-react";

export const AVAILABLE_ARTIFICES: ArtificeDefinition[] = [
  {
    id: "eternal_growth_gem",
    name: "Eternal Growth Gem",
    description: "A pulsating gem that hums with untapped potential.",
    effectDescription: "+5% to all income permanently.",
    icon: Gem,
    effect: {
      type: "GLOBAL_INCOME_MULTIPLIER",
      value: 1.05,
    },
  },
  {
    id: "efficiency_charter",
    name: "Charter of Efficiency",
    description: "An ancient document detailing masterful operational processes.",
    effectDescription: "-5% to all upkeep costs permanently.",
    icon: Award,
    effect: {
      type: "GLOBAL_UPKEEP_REDUCTION_MULTIPLIER",
      value: 0.95,
    },
  },
  {
    id: "seo_specialist_inspiration_orb",
    name: "Inspiration Orb (SEO)",
    description: "Boosts the effectiveness of your SEO Specialists.",
    effectDescription: "+10% income from SEO Specialists permanently.",
    icon: Sparkles,
    effect: {
      type: "EMPLOYEE_SPECIFIC_INCOME_MULTIPLIER",
      employeeId: "seo_specialist",
      value: 1.10,
    },
  },
  {
    id: "intern_manual_of_thrift",
    name: "Manual of Thrift (Intern)",
    description: "A surprisingly effective guide for reducing intern-related expenses.",
    effectDescription: "-20% upkeep for Marketing Interns permanently.",
    icon: ShieldHalf,
    effect: {
      type: "EMPLOYEE_SPECIFIC_UPKEEP_REDUCTION_MULTIPLIER",
      employeeId: "intern",
      value: 0.80,
    },
  },
  {
    id: "golden_handshake_token",
    name: "Golden Handshake Token",
    description: "Makes hiring new talent slightly more affordable across the board.",
    effectDescription: "-5% to base hire cost for all employees permanently.",
    icon: DollarSignIcon,
    effect: {
      type: "ALL_EMPLOYEES_HIRE_COST_MULTIPLIER",
      value: 0.95,
    },
  },
  {
    id: "strategist_negotiation_guide",
    name: "Negotiation Guide (Sr. Strategist)",
    description: "Master the art of salary negotiation for Senior Strategists.",
    effectDescription: "-10% to base hire cost for Senior Strategists permanently.",
    icon: TrendingUpIcon, // Using a generic one as example
    effect: {
      type: "SPECIFIC_EMPLOYEE_HIRE_COST_MULTIPLIER",
      employeeId: "senior_strategist",
      value: 0.90,
    },
  }
];
