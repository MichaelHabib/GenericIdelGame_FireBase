
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Zap, Gem } from "lucide-react"; // Added Gem for Legacy Tokens
import { useGame } from "./GameProvider";
import { Skeleton } from "./ui/skeleton";

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; colorClass?: string; dataTestId?: string }> = ({ title, value, icon: Icon, colorClass, dataTestId }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${colorClass || 'text-muted-foreground'}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" data-testid={dataTestId}>{typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1}) : value}</div>
    </CardContent>
  </Card>
);


export function Dashboard() {
  const { points, totalPointsPerSecond, pointsPerClick, gameInitialized, legacyTokens } = useGame();

  if (!gameInitialized) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Points" 
        value={`${points.toFixed(0)}`} 
        icon={Coins} 
        colorClass={"text-primary"}
        dataTestId="points"
      />
      <StatCard 
        title="Points / Second (PPS)" 
        value={`${totalPointsPerSecond.toFixed(1)}`} 
        icon={TrendingUp} 
        colorClass="text-accent"
        dataTestId="points-per-second"
      />
      <StatCard 
        title="Points / Click (PPC)" 
        value={`${pointsPerClick.toFixed(1)}`} 
        icon={Zap} 
        colorClass="text-amber-500"
        dataTestId="points-per-click"
      />
      <StatCard
        title="Legacy Tokens"
        value={legacyTokens}
        icon={Gem}
        colorClass="text-purple-500" // Example color for Legacy Tokens
        dataTestId="legacy-tokens"
      />
    </div>
  );
}
