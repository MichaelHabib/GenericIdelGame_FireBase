
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Zap } from "lucide-react"; // Changed icons
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
  const { points, totalPointsPerSecond, pointsPerClick, gameInitialized } = useGame();

  if (!gameInitialized) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-3">
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
        colorClass="text-amber-500" // Example color for PPC
        dataTestId="points-per-click"
      />
    </div>
  );
}
