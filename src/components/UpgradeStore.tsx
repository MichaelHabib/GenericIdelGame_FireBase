
"use client";

import { UpgradeCard } from "./UpgradeCard"; 
import { useGame } from "./GameProvider";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { AVAILABLE_UPGRADES } from "@/config/upgrades"; 
import { Button } from "./ui/button";
import type { PurchaseMultiplier } from "@/lib/types";

const multiplierOptions: PurchaseMultiplier[] = [1, 5, 10, 25, 50, 100, 1000, 10000, 100000, 1000000, "MAX"];

export function UpgradeStore() {
  const { 
    points, 
    gameInitialized, 
    purchasedUpgrades, 
    purchaseMultiplier, 
    setPurchaseMultiplier 
  } = useGame(); 
  
  const upgrades = AVAILABLE_UPGRADES;

  if (!gameInitialized) {
    return (
      <Card className="flex flex-col flex-grow">
        <CardHeader>
          <CardTitle>Available Upgrades</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1"><Skeleton className="h-5 w-32" /><Skeleton className="h-3 w-48" /></div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg flex flex-col flex-grow">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Purchase Upgrades</CardTitle>
        <CardDescription>Invest your points to increase your passive Points Per Second (PPS).</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Purchase Multiplier:</p>
          <div className="flex flex-wrap gap-2">
            {multiplierOptions.map((multiplier) => (
              <Button
                key={multiplier}
                variant={purchaseMultiplier === multiplier ? "default" : "outline"}
                size="sm"
                onClick={() => setPurchaseMultiplier(multiplier)}
              >
                {typeof multiplier === 'number' && multiplier >= 1000 ? 
                  (multiplier >= 1000000 ? `${multiplier/1000000}M` : `${multiplier/1000}K`): 
                  multiplier}
              </Button>
            ))}
          </div>
        </div>

        {upgrades.length === 0 ? (
          <p>No upgrades available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upgrades.map(upg => {
              const totalPurchasedForThisUpgrade = purchasedUpgrades[upg.id]?.quantity || 0;
              return (
                <UpgradeCard
                  key={upg.id}
                  upgrade={upg}
                  currentPoints={points}
                  totalPurchased={totalPurchasedForThisUpgrade}
                  currentMultiplier={purchaseMultiplier}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
