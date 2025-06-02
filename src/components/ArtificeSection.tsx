
"use client";

import { useGame } from "./GameProvider";
import { AVAILABLE_ARTIFICES } from "@/config/artifices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Info } from "lucide-react";
import type React from "react";
import { Skeleton } from "./ui/skeleton";
import type { ArtificeDefinition } from "@/lib/types";

const ArtificeDisplayCard: React.FC<{ artificeDef: ArtificeDefinition }> = ({ artificeDef }) => {
  const IconComponent = artificeDef.icon;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <IconComponent size={32} className="text-primary mt-1" />
          <div>
            <CardTitle className="text-md">{artificeDef.name}</CardTitle>
            <CardDescription className="text-xs mt-1">{artificeDef.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold text-accent">{artificeDef.effectDescription}</p>
      </CardContent>
    </Card>
  );
};

export function ArtificeSection() {
  const { acquiredArtifices, gameInitialized } = useGame();
  const artificeIds = Object.keys(acquiredArtifices);

  if (!gameInitialized) {
    return (
      <Card className="flex flex-col flex-grow">
        <CardHeader>
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-4 w-3/5" />
        </CardHeader>
        <CardContent className="space-y-3 flex-grow">
          {[...Array(1)].map((_, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-start space-x-2">
                <Skeleton className="h-8 w-8 rounded-md mt-1" />
                <div className="flex-grow space-y-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg flex flex-col flex-grow">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Sparkles className="mr-3 h-6 w-6 text-amber-500" /> Acquired Artifices
        </CardTitle>
        <CardDescription>Ancient relics granting permanent boosts to your game.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {artificeIds.length === 0 ? (
          <div className="text-center py-8">
            <Info className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No Artifices acquired yet.</p>
            <p className="text-sm text-muted-foreground">These rare items may drop randomly as you play or click.</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-3"> {/* Changed from h-[200px] */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artificeIds.map(id => {
                const artificeDef = AVAILABLE_ARTIFICES.find(a => a.id === id);
                return artificeDef ? <ArtificeDisplayCard key={id} artificeDef={artificeDef} /> : null;
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

    