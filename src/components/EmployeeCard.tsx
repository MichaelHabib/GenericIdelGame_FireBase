
"use client";

import type { EmployeeDefinition } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, TrendingDown, BadgeDollarSign } from "lucide-react";
import type React from "react";

interface EmployeeCardProps {
  employee: EmployeeDefinition;
  onHire: (id: string) => void;
  currentBalance: number;
  isGameOver: boolean;
}

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string | number, valueClass?: string }> = ({ icon: Icon, label, value, valueClass }) => (
  <div className="flex items-center text-sm text-muted-foreground">
    <Icon className="mr-2 h-4 w-4" />
    <span>{label}:</span>
    <span className={`ml-auto font-semibold ${valueClass || 'text-foreground'}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
  </div>
);

export function EmployeeCard({ employee, onHire, currentBalance, isGameOver }: EmployeeCardProps) {
  const IconComponent = employee.icon;
  const canAfford = currentBalance >= employee.hireCost;

  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <IconComponent size={36} className="text-primary" />
          <div>
            <CardTitle className="text-lg">{employee.name}</CardTitle>
            <CardDescription className="text-xs">{employee.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-0">
        <DetailItem icon={BadgeDollarSign} label="Hire Cost" value={`$${employee.hireCost}`} />
        <DetailItem icon={TrendingUp} label="Income/sec" value={`$${employee.incomePerSecond}`} valueClass="text-accent" />
        <DetailItem icon={TrendingDown} label="Upkeep/sec" value={`$${employee.upkeepPerSecond}`} valueClass="text-destructive" />
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onHire(employee.id)}
          disabled={!canAfford || isGameOver}
          className="w-full transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
          aria-label={`Hire ${employee.name}`}
        >
          <Coins className="mr-2 h-4 w-4" /> Hire {canAfford || isGameOver ? "" : `(${(employee.hireCost - currentBalance).toFixed(0)} more needed)`}
        </Button>
      </CardFooter>
    </Card>
  );
}
