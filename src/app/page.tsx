
"use client";

import { GameProvider, useGame } from "@/components/GameProvider";
import { Dashboard } from "@/components/Dashboard";
import { EmployeeList } from "@/components/EmployeeList";
import { HiredEmployeesSummary } from "@/components/HiredEmployeesSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ServerCrash } from "lucide-react";
import Image from "next/image";

function GameUI() {
  const { isGameOver, resetGame, gameInitialized, balance } = useGame();

  if (!gameInitialized) {
    // Optional: Show a loading state or placeholder until game initializes
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-secondary">
            <div className="animate-pulse text-primary text-2xl font-semibold">Loading Marketopia...</div>
        </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-destructive/10">
        <Card className="w-full max-w-md text-center shadow-2xl border-destructive">
          <CardHeader>
            <ServerCrash className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-3xl font-bold text-destructive">Game Over!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your marketing agency couldn't stay afloat. But don't worry, every great entrepreneur faces setbacks!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-lg">Final Balance: <span className="font-bold text-destructive">${balance.toFixed(0)}</span></p>
            <Button onClick={resetGame} size="lg" className="w-full bg-primary hover:bg-primary/90">
              <RefreshCw className="mr-2 h-5 w-5" /> Start New Agency
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
         <Image src="/logo.svg" alt="Marketopia Logo" width={60} height={60} data-ai-hint="agency logo" className="mr-3" />
          <h1 className="text-5xl font-bold text-primary tracking-tight">
            Marketopia
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">Build Your Marketing Empire!</p>
      </header>
      
      <main className="space-y-8 max-w-7xl mx-auto">
        <Dashboard />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EmployeeList />
          </div>
          <div>
            <HiredEmployeesSummary />
          </div>
        </div>
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Marketopia Inc. All rights reserved.</p>
        <p>Press Ctrl+B (or Cmd+B) to toggle the (non-existent) sidebar for a surprise!</p>
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
