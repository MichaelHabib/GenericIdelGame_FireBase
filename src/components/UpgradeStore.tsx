
"use client";

import { UpgradeCard } from "./UpgradeCard"; // Renamed from EmployeeCard
import { useGame } from "./GameProvider";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AVAILABLE_UPGRADES } from "@/config/upgrades"; // Renamed from employees

export function UpgradeStore() {
  const { purchaseUpgrade, points, gameInitialized, purchasedUpgrades } = useGame(); // Renamed
  const upgrades = AVAILABLE_UPGRADES;

  if (!gameInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Upgrades</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Purchase Upgrades</CardTitle>
        <p className="text-muted-foreground">Invest your points to increase your passive Points Per Second (PPS).</p>
      </CardHeader>
      <CardContent>
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
                  onPurchase={purchaseUpgrade}
                  currentPoints={points}
                  totalPurchased={totalPurchasedForThisUpgrade}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
