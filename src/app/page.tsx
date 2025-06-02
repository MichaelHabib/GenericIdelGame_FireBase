
"use client";

import { GameProvider, useGame } from "@/components/GameProvider";
import { Dashboard } from "@/components/Dashboard";
import { UpgradeStore } from "@/components/UpgradeStore"; // Renamed
import { PurchasedUpgradesSummary } from "@/components/PurchasedUpgradesSummary"; // Renamed
import { InventorySection } from "@/components/InventorySection";
import { ArtificeSection } from "@/components/ArtificeSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Zap, Pointer } from "lucide-react"; // Added Zap, Pointer
import Image from "next/image";

function GameUI() {
  const { resetGame, gameInitialized, clickMasterButton } = useGame(); // isGameOver and balance removed

  if (!gameInitialized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-secondary">
            <div className="animate-pulse text-primary text-2xl font-semibold">Loading Clicker Game...</div>
        </div>
    );
  }

  // Game Over screen removed as upkeep/negative balance condition is removed

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
         <Image src="/logo.svg" alt="Game Logo" width={60} height={60} data-ai-hint="game logo" className="mr-3" />
          <h1 className="text-5xl font-bold text-primary tracking-tight">
            Point Clicker Pro
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">Click your way to victory!</p>
      </header>
      
      <main className="space-y-8 max-w-7xl mx-auto">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <UpgradeStore /> 
            <ArtificeSection /> 
          </div>
          <div className="space-y-8">
            <PurchasedUpgradesSummary />
            <InventorySection />
          </div>
        </div>

        <div className="flex justify-center mt-8">
            <Button onClick={resetGame} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-5 w-5" /> Reset Game
            </Button>
        </div>
        
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Clicker Game Studios. All rights reserved.</p>
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
