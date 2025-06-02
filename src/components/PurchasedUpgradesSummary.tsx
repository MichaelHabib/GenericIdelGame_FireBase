
"use client";

import { useGame } from "./GameProvider";
import { AVAILABLE_UPGRADES } from "@/config/upgrades";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, TrendingUp, ShoppingBag } from "lucide-react"; // Changed icon
import type React from "react";
import { Skeleton } from "./ui/skeleton";

interface PurchasedUpgradeRowProps {
  upgradeId: string;
  quantity: number;
}

const PurchasedUpgradeRow: React.FC<PurchasedUpgradeRowProps> = ({ upgradeId, quantity }) => {
  const upgradeDef = AVAILABLE_UPGRADES.find(u => u.id === upgradeId);
  if (!upgradeDef) return null;

  const IconComponent = upgradeDef.icon;

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <IconComponent className="h-6 w-6 text-primary" />
        <div>
          <p className="font-medium">{upgradeDef.name}</p>
          <p className="text-xs text-muted-foreground">Quantity: {quantity}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-accent flex items-center justify-end">
          <TrendingUp className="h-4 w-4 mr-1" /> +{(upgradeDef.ppsPerUnit * quantity).toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1})}/s
        </p>
        {/* Upkeep removed */}
      </div>
    </div>
  );
};

export function PurchasedUpgradesSummary() {
  const { purchasedUpgrades, gameInitialized } = useGame();
  const purchasedUpgradeIds = Object.keys(purchasedUpgrades);

  if (!gameInitialized) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(2)].map((_, i) => (
             <div key={i} className="flex items-center justify-between p-3">
               <div className="flex items-center gap-3">
                 <Skeleton className="h-6 w-6 rounded-full" />
                 <div className="space-y-1"><Skeleton className="h-5 w-24" /><Skeleton className="h-3 w-16" /></div>
               </div>
               <div className="space-y-1 text-right"><Skeleton className="h-4 w-12" /></div>
             </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <ShoppingBag className="mr-3 h-6 w-6" /> My Upgrades
        </CardTitle>
        <CardDescription>Overview of your purchased point-generating upgrades.</CardDescription>
      </CardHeader>
      <CardContent>
        {purchasedUpgradeIds.length === 0 ? (
          <div className="text-center py-8">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No upgrades purchased yet.</p>
            <p className="text-sm text-muted-foreground">Purchase some upgrades to start generating points passively!</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-3">
            <div className="space-y-2">
              {purchasedUpgradeIds.map(id => (
                <PurchasedUpgradeRow key={id} upgradeId={id} quantity={purchasedUpgrades[id].quantity} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
