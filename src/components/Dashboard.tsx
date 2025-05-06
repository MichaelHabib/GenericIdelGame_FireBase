
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useGame } from "./GameProvider";
import { Skeleton } from "./ui/skeleton";

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; colorClass?: string; dataTestId?: string }> = ({ title, value, icon: Icon, colorClass, dataTestId }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${colorClass || 'text-muted-foreground'}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" data-testid={dataTestId}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </CardContent>
  </Card>
);


export function Dashboard() {
  const { balance, totalIncomePerSecond, totalUpkeepPerSecond, isGameOver, gameInitialized } = useGame();

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
        title="Current Balance" 
        value={`$${balance.toFixed(0)}`} 
        icon={DollarSign} 
        colorClass={isGameOver ? "text-destructive" : balance < 0 ? "text-destructive" : "text-primary"}
        dataTestId="balance"
      />
      <StatCard 
        title="Income / Second" 
        value={`$${totalIncomePerSecond.toFixed(0)}`} 
        icon={TrendingUp} 
        colorClass="text-accent"
        dataTestId="income-per-second"
      />
      <StatCard 
        title="Upkeep / Second" 
        value={`$${totalUpkeepPerSecond.toFixed(0)}`} 
        icon={TrendingDown} 
        colorClass="text-destructive"
        dataTestId="upkeep-per-second"
      />
    </div>
  );
}
