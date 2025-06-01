
import type { EmployeeDefinition } from "@/lib/types";
import { Coffee, Lightbulb, Target, Megaphone, Users, Bot } from "lucide-react";
// INITIAL_BALANCE is now in gameConfig.ts

export const AVAILABLE_EMPLOYEES: EmployeeDefinition[] = [
 {
 id: "intern",
 name: "Marketing Intern",
 description: "Eager to learn, fetches coffee, and occasionally posts on social media.",
 icon: Coffee,
 baseHireCost: 50, 
 incomePerSecond: 5,
 upkeepPerSecond: 1,
 },
 {
 id: "junior_marketer",
 name: "Junior Marketer",
 description: "Handles basic campaigns and content creation.",
 icon: Lightbulb,
 baseHireCost: 250, 
 incomePerSecond: 20,
 upkeepPerSecond: 5,
 },
 {
 id: "seo_specialist",
 name: "SEO Specialist",
 description: "Optimizes content for search engines to attract organic traffic.",
 icon: Users, // Changed from Megaphone to Users for better representation
 baseHireCost: 600, 
 incomePerSecond: 50,
 upkeepPerSecond: 15,
 },
 {
 id: "senior_strategist",
 name: "Senior Strategist",
 description: "Develops high-level marketing strategies and oversees major accounts.",
 icon: Target,
 baseHireCost: 1500, 
 incomePerSecond: 120,
 upkeepPerSecond: 40,
 },
 {
 id: "automation_bot",
 name: "Marketing AI Bot",
 description: "Automates repetitive tasks and analyzes data for insights.",
 icon: Bot,
 baseHireCost: 5000, 
 incomePerSecond: 300,
 upkeepPerSecond: 50,
 },
];

// quantity is the number of this specific employee type ALREADY HIRED
export const calculateExponentialHireCost = (baseCost: number, quantity: number): number => {
 return baseCost * Math.pow(1.15, quantity); 
};
