
"use client";

import { useGame } from "./GameProvider";
import { AVAILABLE_EMPLOYEES } from "@/config/employees";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, TrendingUp, TrendingDown, Briefcase } from "lucide-react";
import type React from "react";
import { Skeleton } from "./ui/skeleton";

interface HiredEmployeeRowProps {
  employeeId: string;
  quantity: number;
}

const HiredEmployeeRow: React.FC<HiredEmployeeRowProps> = ({ employeeId, quantity }) => {
  const employeeDef = AVAILABLE_EMPLOYEES.find(e => e.id === employeeId);
  if (!employeeDef) return null;

  const IconComponent = employeeDef.icon;

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <IconComponent className="h-6 w-6 text-primary" />
        <div>
          <p className="font-medium">{employeeDef.name}</p>
          <p className="text-xs text-muted-foreground">Quantity: {quantity}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-accent flex items-center justify-end">
          <TrendingUp className="h-4 w-4 mr-1" /> +${(employeeDef.incomePerSecond * quantity).toLocaleString()}/s
        </p>
        <p className="text-xs text-destructive flex items-center justify-end">
          <TrendingDown className="h-3 w-3 mr-1" /> -${(employeeDef.upkeepPerSecond * quantity).toLocaleString()}/s
        </p>
      </div>
    </div>
  );
};


export function HiredEmployeesSummary() {
  const { hiredEmployees, gameInitialized } = useGame();
  const hiredEmployeeIds = Object.keys(hiredEmployees);

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
               <div className="space-y-1 text-right"><Skeleton className="h-4 w-12" /><Skeleton className="h-3 w-10" /></div>
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
          <Briefcase className="mr-3 h-6 w-6" /> My Team
        </CardTitle>
        <CardDescription>Overview of your marketing agency's workforce.</CardDescription>
      </CardHeader>
      <CardContent>
        {hiredEmployeeIds.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your team is empty.</p>
            <p className="text-sm text-muted-foreground">Hire some employees to get started!</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-3"> {/* Adjust height as needed */}
            <div className="space-y-2">
              {hiredEmployeeIds.map(id => (
                <HiredEmployeeRow key={id} employeeId={id} quantity={hiredEmployees[id].quantity} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
