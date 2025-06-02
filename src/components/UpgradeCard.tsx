
"use client";

import type { UpgradeDefinition, PurchaseMultiplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, BadgeDollarSign, Zap, Layers } from "lucide-react";
import React from "react";
import { calculateExponentialUpgradeCost, calculateTotalCostForQuantity, calculateMaxAffordable } from "@/config/upgrades";
import { useGame } from "./GameProvider"; // Import useGame to access purchaseUpgrade

interface UpgradeCardProps {
  upgrade: UpgradeDefinition;
  currentPoints: number;
  totalPurchased: number; // Quantity of this specific upgrade type already purchased
  currentMultiplier: PurchaseMultiplier;
}

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string | number, valueClass?: string }> = ({ icon: Icon, label, value, valueClass }) => (
  <div className="flex items-center text-sm text-muted-foreground">
    <Icon className="mr-2 h-4 w-4" />
    <span>{label}:</span>
    <span className={`ml-auto font-semibold ${valueClass || 'text-foreground'}`}>{typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: value % 1 !== 0 ? 1 : 0}) : value}</span>
  </div>
);

export function UpgradeCard({ upgrade, currentPoints, totalPurchased, currentMultiplier }: UpgradeCardProps) {
  const { purchaseUpgrade, acquiredArtifices, purchasedPrestigeUpgrades } = useGame(); // Get purchaseUpgrade from context
  const IconComponent = upgrade.icon;

  let baseCostForCalc = upgrade.baseCost;
    Object.values(acquiredArtifices).forEach(artifice => {
        const artificeDef = AVAILABLE_ARTIFICES.find(ad => ad.id === artifice.artificeId);
        if (artificeDef) {
            if (artificeDef.effect.type === "ALL_UPGRADES_COST_MULTIPLIER") {
                baseCostForCalc *= artificeDef.effect.value;
            }
            if (artificeDef.effect.type === "SPECIFIC_UPGRADE_COST_MULTIPLIER" && artificeDef.effect.upgradeId === upgrade.id) {
                baseCostForCalc *= artificeDef.effect.value;
            }
        }
    });
    const economicInsight = purchasedPrestigeUpgrades['prestige_cheaper_upgrades'];
    if (economicInsight) {
        baseCostForCalc *= (1 - (0.02 * economicInsight.level));
    }


  const { cost: displayCost, quantity: displayQuantity } = React.useMemo(() => {
    if (currentMultiplier === "MAX") {
      const { quantity, totalCost } = calculateMaxAffordable(baseCostForCalc, totalPurchased, currentPoints);
      return { cost: totalCost, quantity };
    }
    const cost = calculateTotalCostForQuantity(baseCostForCalc, totalPurchased, currentMultiplier);
    return { cost, quantity: currentMultiplier };
  }, [baseCostForCalc, totalPurchased, currentMultiplier, currentPoints]);

  const canAfford = currentPoints >= displayCost && displayQuantity > 0;
  const totalPpsFromThisType = upgrade.ppsPerUnit * totalPurchased;

  const purchaseButtonText = () => {
    if (currentMultiplier === "MAX") {
      return `Buy Max (${displayQuantity.toLocaleString()})`;
    }
    if (currentMultiplier > 1) {
      return `Buy x${currentMultiplier.toLocaleString()}`;
    }
    return "Purchase";
  };

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
        <DetailItem icon={BadgeDollarSign} label={`Cost ${currentMultiplier === "MAX" ? `(x${displayQuantity.toLocaleString()})` : currentMultiplier > 1 ? `(x${currentMultiplier.toLocaleString()})` : ''}`} value={`${displayCost.toFixed(0)} Pts`} />
        <DetailItem icon={Zap} label="PPS/Unit" value={`${upgrade.ppsPerUnit.toFixed(1)}`} valueClass="text-accent" />
        <DetailItem icon={Layers} label="Quantity Owned" value={totalPurchased} />
        {totalPurchased > 0 && (
          <DetailItem icon={TrendingUp} label="Total PPS (this type)" value={`${totalPpsFromThisType.toFixed(1)}`} valueClass="text-accent" />
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => purchaseUpgrade(upgrade.id, currentMultiplier)} // Use purchaseUpgrade from context
          disabled={!canAfford}
          className="w-full transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
          aria-label={`Purchase ${upgrade.name}`}
        >
          <Coins className="mr-2 h-4 w-4" /> 
          {purchaseButtonText()} {!canAfford && displayQuantity > 0 ? `(${(displayCost - currentPoints).toFixed(0)} more needed)` : ""}
          {!canAfford && displayQuantity === 0 && currentMultiplier === "MAX" ? " (Can't afford any)" : ""}
        </Button>
      </CardFooter>
    </Card>
  );
}
// Need to import AVAILABLE_ARTIFICES and AVAILABLE_PRESTIGE_UPGRADES for cost calculation
import { AVAILABLE_ARTIFICES } from "@/config/artifices";
import { AVAILABLE_PRESTIGE_UPGRADES } from "@/config/prestige";
