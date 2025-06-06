
"use client";

import { GameProvider, useGame } from "@/components/GameProvider";
import { Dashboard } from "@/components/Dashboard";
import { UpgradeStore } from "@/components/UpgradeStore";
import { InventorySection } from "@/components/InventorySection";
import { ArtificeSection } from "@/components/ArtificeSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { PrestigeSection } from "@/components/PrestigeSection"; // Added
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Pointer } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function GameUI() {
  const { resetGame, gameInitialized, clickMasterButton } = useGame();

  if (!gameInitialized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-secondary">
            <div className="animate-pulse text-primary text-2xl font-semibold">Loading Clicker Game...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8 flex flex-col">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
         <Image src="/logo.svg" alt="Game Logo" width={60} height={60} data-ai-hint="game logo" className="mr-3" />
          <h1 className="text-5xl font-bold text-primary tracking-tight">
            Point Clicker Pro
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">Click your way to victory!</p>
      </header>
      
      <main className="space-y-8 max-w-7xl mx-auto w-full flex flex-col flex-grow">
        <Dashboard />

        <Card className="shadow-xl border-primary/50">
            <CardContent className="p-6 flex flex-col items-center justify-center">
                <Button 
                    onClick={clickMasterButton} 
                    size="lg" 
                    className="px-10 py-8 text-2xl font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg rounded-xl"
                    aria-label="Click to earn points"
                >
                    <Pointer className="mr-3 h-8 w-8 animate-pulse" /> Click for Points!
                </Button>
            </CardContent>
        </Card>
        
        <Tabs defaultValue="upgrades" className="w-full mt-8 flex flex-col flex-grow">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5"> {/* Adjusted for 5 tabs */}
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="artifices">Artifices</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="prestige">Prestige</TabsTrigger> {/* Added Prestige Tab */}
          </TabsList>
          <TabsContent value="upgrades" className="flex flex-col mt-2">
            <div className="min-h-[50vh] flex flex-col flex-grow">
              <UpgradeStore />
            </div>
          </TabsContent>
          <TabsContent value="inventory" className="flex flex-col mt-2">
             <div className="min-h-[50vh] flex flex-col flex-grow">
              <InventorySection />
            </div>
          </TabsContent>
          <TabsContent value="artifices" className="flex flex-col mt-2">
            <div className="min-h-[50vh] flex flex-col flex-grow">
              <ArtificeSection />
            </div>
          </TabsContent>
          <TabsContent value="achievements" className="flex flex-col mt-2">
             <div className="min-h-[50vh] flex flex-col flex-grow">
              <AchievementsSection />
            </div>
          </TabsContent>
          <TabsContent value="prestige" className="flex flex-col mt-2"> {/* Added Prestige Content */}
             <div className="min-h-[50vh] flex flex-col flex-grow">
              <PrestigeSection />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-auto pt-8"> 
            <Button onClick={resetGame} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-5 w-5" /> Reset Game
            </Button>
        </div>
        
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground shrink-0">
        <p>&copy; {new Date().getFullYear()} Clicker Game Studios. All rights reserved.</p>
        <p className="text-xs">Game data is saved locally in your browser.</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
}
