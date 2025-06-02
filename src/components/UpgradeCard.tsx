
"use client";

import type { UpgradeDefinition } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, BadgeDollarSign, Zap } from "lucide-react";
import type React from "react";
import { calculateExponentialUpgradeCost } from "@/config/upgrades";

interface UpgradeCardProps {
  upgrade: UpgradeDefinition;
  onPurchase: (id: string) => void;
  currentPoints: number;
  totalPurchased: number; // Quantity of this specific upgrade type already purchased
}

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string | number, valueClass?: string }> = ({ icon: Icon, label, value, valueClass }) => (
  <div className="flex items-center text-sm text-muted-foreground">
    <Icon className="mr-2 h-4 w-4" />
    <span>{label}:</span>
    <span className={`ml-auto font-semibold ${valueClass || 'text-foreground'}`}>{typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: value % 1 !== 0 ? 1 : 0}) : value}</span>
  </div>
);

export function UpgradeCard({ upgrade, onPurchase, currentPoints, totalPurchased }: UpgradeCardProps) {
  const IconComponent = upgrade.icon;
  const calculatedPurchaseCost = calculateExponentialUpgradeCost(upgrade.baseCost, totalPurchased);
  const canAfford = currentPoints >= calculatedPurchaseCost;

  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 text-left">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <IconComponent size={36} className="text-primary" />
          <div>
            <CardTitle className="text-lg">{upgrade.name}</CardTitle>
            <CardDescription className="text-xs">{upgrade.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-0">
        <DetailItem icon={BadgeDollarSign} label="Next Cost" value={`${calculatedPurchaseCost.toFixed(0)} Pts`} />
        <DetailItem icon={Zap} label="PPS/Unit" value={`${upgrade.ppsPerUnit.toFixed(1)}`} valueClass="text-accent" />
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onPurchase(upgrade.id)}
          disabled={!canAfford}
          className="w-full transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
          aria-label={`Purchase ${upgrade.name} for ${calculatedPurchaseCost.toFixed(0)} Points`}
        >
          <Coins className="mr-2 h-4 w-4" /> 
          Purchase {!canAfford ? `(${(calculatedPurchaseCost - currentPoints).toFixed(0)} more needed)` : ""}
        </Button>
      </CardFooter>
    </Card>
  );
}
