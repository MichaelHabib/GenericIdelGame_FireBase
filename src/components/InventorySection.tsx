
"use client";

import { useGame } from "./GameProvider";
import { AVAILABLE_ITEMS } from "@/config/items";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PackageSearch, Info, CheckCircle, Zap } from "lucide-react";
import type React from "react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import type { ActiveBuff, ItemDefinition } from "@/lib/types";


const ItemCard: React.FC<{ itemId: string; quantity: number; onUse: (itemId: string) => void; }> = ({ itemId, quantity, onUse }) => {
  const itemDef = AVAILABLE_ITEMS.find(item => item.id === itemId);
  if (!itemDef) return null;

  const IconComponent = itemDef.icon;

  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <IconComponent size={32} className="text-primary" />
          <div>
            <CardTitle className="text-md">{itemDef.name} <Badge variant="secondary" className="ml-2">x{quantity}</Badge></CardTitle>
            <CardDescription className="text-xs">{itemDef.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Button 
          onClick={() => onUse(itemId)} 
          disabled={quantity <= 0} 
          className="w-full"
          size="sm"
        >
          <Zap className="mr-2 h-4 w-4" /> Use Item
        </Button>
      </CardFooter>
    </Card>
  );
};

const ActiveBuffDisplay: React.FC<{ buff: ActiveBuff }> = ({ buff }) => {
  const itemDef = AVAILABLE_ITEMS.find(item => item.id === buff.itemId);
  if (!itemDef) return null;

  const Icon = itemDef.icon;
  const timeLeft = Math.max(0, Math.round((buff.expiresAt - Date.now()) / 1000));
  
  let effectText = "";
  if (itemDef.effect.type === "PPS_MULTIPLIER") {
    effectText = `+${((buff.value - 1) * 100).toFixed(0)}% PPS`;
  }

  return (
    <div className="flex items-center justify-between p-2 bg-accent/10 rounded-md border border-accent/30">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent" />
        <div>
          <p className="text-sm font-medium text-accent-foreground">{itemDef.name}</p>
          <p className="text-xs text-muted-foreground">{effectText}</p>
        </div>
      </div>
      <Badge variant="outline" className="text-accent-foreground border-accent/50">{timeLeft}s left</Badge>
    </div>
  );
};

export function InventorySection() {
  const { inventory, useItem, gameInitialized, activeBuffs } = useGame();
  const inventoryItemIds = Object.keys(inventory);

  if (!gameInitialized) {
    return (
      <Card className="flex flex-col flex-grow">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
           <Skeleton className="h-5 w-1/4 mb-2" />
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="flex-grow space-y-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6 flex flex-col flex-grow">
      <Card className="shadow-lg flex flex-col flex-grow">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <PackageSearch className="mr-3 h-6 w-6" /> My Inventory
          </CardTitle>
          <CardDescription>Items you've collected. Use them wisely!</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {inventoryItemIds.length === 0 ? (
            <div className="text-center py-8">
              <Info className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Your inventory is empty.</p>
              <p className="text-sm text-muted-foreground">Items will randomly drop as you play or click.</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-3"> {/* Changed from h-[280px] */}
              <div className="space-y-4">
                {inventoryItemIds.map(id => (
                  <ItemCard 
                    key={id} 
                    itemId={id} 
                    quantity={inventory[id].quantity} 
                    onUse={useItem}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {activeBuffs.length > 0 && (
        <Card className="shadow-lg mt-4 shrink-0"> {/* Added shrink-0 to prevent this card from growing excessively */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <CheckCircle className="mr-3 h-5 w-5 text-accent" /> Active Effects
            </CardTitle>
            <CardDescription>Temporary boosts currently affecting your game.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeBuffs.map(buff => (
              <ActiveBuffDisplay key={buff.itemId + buff.effectType + buff.expiresAt} buff={buff} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    