
"use client";

import { useGame } from "./GameProvider";
import { AVAILABLE_PRESTIGE_UPGRADES } from "@/config/prestige";
import { PRESTIGE_POINTS_REQUIREMENT, LEGACY_TOKEN_FORMULA, PRESTIGE_REQUIREMENT_INCREASE_FACTOR } from "@/config/gameConfig";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gem, Zap, TrendingUp, Award, Shield, Star, ZapIcon } from "lucide-react";
import type React from "react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import type { PrestigeUpgradeDefinition } from "@/lib/types";

const PrestigeUpgradeCard: React.FC<{
  upgradeDef: PrestigeUpgradeDefinition;
  onPurchase: (id: string) => void;
  currentLegacyTokens: number;
  currentLevel: number;
}> = ({ upgradeDef, onPurchase, currentLegacyTokens, currentLevel }) => {
  const IconComponent = upgradeDef.icon;
  const cost = upgradeDef.cost; // For now, let's assume cost doesn't scale with level here
  const canAfford = currentLegacyTokens >= cost;
  const isMaxLevel = upgradeDef.maxLevel && currentLevel >= upgradeDef.maxLevel;

  let effectDescription = upgradeDef.description;
  if(upgradeDef.effect.type === "GLOBAL_PPS_BOOST_PRESTIGE" || upgradeDef.effect.type === "GLOBAL_PPC_BOOST_PRESTIGE"){
    effectDescription = upgradeDef.description.replace(/\d+(\.\d+)?%/, `${(upgradeDef.effect.value * (currentLevel +1) * 100).toFixed(0)}%`);
  } else if (upgradeDef.id === "prestige_cheaper_upgrades") {
    effectDescription = upgradeDef.description.replace(/\d+(\.\d+)?%/, `${(2 * (currentLevel +1)).toFixed(0)}%`);
  }


  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <IconComponent size={32} className="text-purple-500" />
          <div>
            <CardTitle className="text-md">{upgradeDef.name} {upgradeDef.maxLevel ? `(Lvl ${currentLevel}/${upgradeDef.maxLevel})` : ''}</CardTitle>
            <CardDescription className="text-xs mt-1">{effectDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
       <CardContent className="flex-grow space-y-2 pt-0">
         <div className="flex items-center text-sm text-muted-foreground">
            <Gem className="mr-2 h-4 w-4 text-purple-400" />
            <span>Cost:</span>
            <span className={`ml-auto font-semibold text-purple-600`}>{cost} LT</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onPurchase(upgradeDef.id)}
          disabled={!canAfford || isMaxLevel}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          {isMaxLevel ? "Max Level" : (canAfford ? <><ZapIcon className="mr-2 h-4 w-4" /> Enhance</> : `Need ${cost - currentLegacyTokens} LT`)}
        </Button>
      </CardFooter>
    </Card>
  );
};


export function PrestigeSection() {
  const { 
    points, 
    legacyTokens, 
    purchasedPrestigeUpgrades, 
    prestigeGame, 
    purchasePrestigeUpgrade, 
    gameInitialized,
    currentPrestigeRequirement,
    prestigeCount
  } = useGame();

  const potentialLgGain = LEGACY_TOKEN_FORMULA(points);

  if (!gameInitialized) {
    return (
      <Card className="shadow-lg flex flex-col flex-grow">
        <CardHeader>
          <Skeleton className="h-7 w-1/2 mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          <Skeleton className="h-10 w-1/2 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-3 space-y-2">
                <div className="flex items-start space-x-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-grow space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg flex flex-col flex-grow">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Star className="mr-3 h-6 w-6 text-yellow-400" /> Prestige System
        </CardTitle>
        <CardDescription>
          Reset your progress to gain Legacy Tokens (LT) and unlock powerful permanent upgrades. 
          Current prestige count: {prestigeCount}. Next prestige at: {currentPrestigeRequirement.toLocaleString()} points.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow">
        <Card className="bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Legacy Tokens on next prestige:</p>
              <p className="text-2xl font-bold text-purple-600">{potentialLgGain.toLocaleString()} LT</p>
            </div>
            <Button 
              onClick={prestigeGame} 
              disabled={points < currentPrestigeRequirement}
              variant="destructive" 
              size="lg"
              className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white hover:opacity-90"
            >
              <Star className="mr-2 h-5 w-5" /> Prestige Now
            </Button>
          </div>
           {points < currentPrestigeRequirement && (
            <p className="text-xs text-destructive mt-1">
              Need {(currentPrestigeRequirement - points).toLocaleString()} more points to prestige.
            </p>
          )}
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-purple-500" /> Prestige Upgrades
          </h3>
          {AVAILABLE_PRESTIGE_UPGRADES.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No prestige upgrades available yet.</p>
          ) : (
            <ScrollArea className="h-[calc(50vh-180px)] pr-3"> {/* Adjust height as needed */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_PRESTIGE_UPGRADES.map(upg => (
                  <PrestigeUpgradeCard
                    key={upg.id}
                    upgradeDef={upg}
                    onPurchase={purchasePrestigeUpgrade}
                    currentLegacyTokens={legacyTokens}
                    currentLevel={purchasedPrestigeUpgrades[upg.id]?.level || 0}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
