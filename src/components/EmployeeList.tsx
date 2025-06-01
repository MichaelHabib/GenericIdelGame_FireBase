
"use client";

import type { EmployeeDefinition } from "@/lib/types";
import { EmployeeCard } from "./EmployeeCard";
import { useGame } from "./GameProvider";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AVAILABLE_EMPLOYEES } from "@/config/employees";

export function EmployeeList() {
  const { hireEmployee, balance, isGameOver, gameInitialized, hiredEmployees } = useGame();
  const employees = AVAILABLE_EMPLOYEES; 

  if (!gameInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available for Hire</CardTitle>
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
              <Skeleton className="h-4 w-28" />
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
        <CardTitle className="text-2xl font-semibold">Grow Your Agency</CardTitle>
        <p className="text-muted-foreground">Hire talented individuals to boost your income.</p>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <p>No employees available for hire at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {employees.map(emp => {
              const totalHiredForThisEmployee = hiredEmployees[emp.id]?.quantity || 0;
              return (
                <EmployeeCard 
                  key={emp.id} 
                  employee={emp} 
                  onHire={hireEmployee} 
                  currentBalance={balance}
                  isGameOver={isGameOver}
                  totalHired={totalHiredForThisEmployee} // Pass the count of this specific employee
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
