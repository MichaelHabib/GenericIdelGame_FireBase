
"use client";

import { useGame } from "./GameProvider";
import { AVAILABLE_ACHIEVEMENTS } from "@/config/achievements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, CheckCircle, Lock } from "lucide-react";
import type React from "react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import type { AchievementDefinition } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AchievementCard: React.FC<{ achievement: AchievementDefinition; isUnlocked: boolean; acquiredAt?: number }> = ({ achievement, isUnlocked, acquiredAt }) => {
  const IconComponent = achievement.icon;
  const dateUnlocked = acquiredAt ? new Date(acquiredAt).toLocaleDateString() : "";

  let rewardText = "";
  if (achievement.reward.type === "POINTS") {
    rewardText = `+${achievement.reward.value.toLocaleString()} Points`;
  } else if (achievement.reward.type === "ITEM") {
    rewardText = `Item: ${achievement.reward.itemId} (x${achievement.reward.quantity})`;
  }
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Card className={`shadow-sm transition-all duration-300 ${isUnlocked ? "border-accent/50 bg-accent/5" : "opacity-70 hover:opacity-100"}`}>
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-start space-x-3">
                <IconComponent size={28} className={`mt-1 ${isUnlocked ? "text-accent" : "text-muted-foreground"}`} />
                <div>
                  <CardTitle className={`text-md ${isUnlocked ? "text-accent-foreground" : ""}`}>{achievement.name}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{achievement.description}</CardDescription>
                </div>
                {isUnlocked ? (
                  <CheckCircle size={20} className="text-green-500 ml-auto shrink-0" />
                ) : (
                  <Lock size={20} className="text-muted-foreground ml-auto shrink-0" />
                )}
              </div>
            </CardHeader>
            {isUnlocked && (
               <CardContent className="pb-3 px-4">
                 <Badge variant="outline" className="text-xs">Unlocked: {dateUnlocked}</Badge>
               </CardContent>
            )}
          </Card>
        </TooltipTrigger>
        {!isUnlocked && (
          <TooltipContent side="top" align="center">
            <p className="text-sm font-semibold">Reward: {rewardText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export function AchievementsSection() {
  const { acquiredAchievements, gameInitialized } = useGame();

  if (!gameInitialized) {
    return (
      <Card className="shadow-lg flex flex-col flex-grow">
        <CardHeader>
          <Skeleton className="h-7 w-2/5 mb-1" />
          <Skeleton className="h-4 w-3/5" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-grow">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-start space-x-2">
                <Skeleton className="h-7 w-7 rounded-md mt-1" />
                <div className="flex-grow space-y-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full ml-auto" />
              </div>
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
          <Award className="mr-3 h-6 w-6 text-amber-400" /> Achievements
        </CardTitle>
        <CardDescription>Milestones and rewards for your clicking journey.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {AVAILABLE_ACHIEVEMENTS.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No achievements defined yet.</p>
        ) : (
          <ScrollArea className="h-full pr-3 -mr-3"> {/* Changed from h-[250px] */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AVAILABLE_ACHIEVEMENTS.map(achDef => {
                const isUnlocked = !!acquiredAchievements[achDef.id];
                const acquiredAt = acquiredAchievements[achDef.id]?.acquiredAt;
                return (
                  <AchievementCard 
                    key={achDef.id} 
                    achievement={achDef} 
                    isUnlocked={isUnlocked}
                    acquiredAt={acquiredAt}
                  />
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

    