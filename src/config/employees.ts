
import type { EmployeeDefinition } from "@/lib/types";
import { Coffee, Lightbulb, Target, Megaphone, Users, Bot } from "lucide-react";

export const INITIAL_BALANCE = 1000;

export const AVAILABLE_EMPLOYEES: EmployeeDefinition[] = [
  {
    id: "intern",
    name: "Marketing Intern",
    description: "Eager to learn, fetches coffee, and occasionally posts on social media.",
    icon: Coffee,
    hireCost: 50,
    incomePerSecond: 5,
    upkeepPerSecond: 1,
  },
  {
    id: "junior_marketer",
    name: "Junior Marketer",
    description: "Handles basic campaigns and content creation.",
    icon: Lightbulb,
    hireCost: 250,
    incomePerSecond: 20,
    upkeepPerSecond: 5,
  },
  {
    id: "seo_specialist",
    name: "SEO Specialist",
    description: "Optimizes content for search engines to attract organic traffic.",
    icon: Users,
    hireCost: 600,
    incomePerSecond: 50,
    upkeepPerSecond: 15,
  },
  {
    id: "senior_strategist",
    name: "Senior Strategist",
    description: "Develops high-level marketing strategies and oversees major accounts.",
    icon: Target,
    hireCost: 1500,
    incomePerSecond: 120,
    upkeepPerSecond: 40,
  },
  {
    id: "automation_bot",
    name: "Marketing AI Bot",
    description: "Automates repetitive tasks and analyzes data for insights.",
    icon: Bot,
    hireCost: 5000,
    incomePerSecond: 300,
    upkeepPerSecond: 50,
  },
];
