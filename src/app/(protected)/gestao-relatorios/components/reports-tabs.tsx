"use client";

import { useState } from "react";

import { UsageByPetReport } from "./usage-by-pet-report";
import { UsageByClinicReport } from "./usage-by-clinic-report";
import { MonthlyBillingReport } from "./monthly-billing-report";
import { Button } from "@/components/ui/button";

export function ReportsTabs() {
  const [activeTab, setActiveTab] = useState<"usage-by-pet" | "usage-by-clinic" | "monthly-billing">("usage-by-pet");

  return (
    <div className="w-full space-y-6">
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "usage-by-pet" ? "default" : "ghost"}
          onClick={() => setActiveTab("usage-by-pet")}
          className="rounded-b-none"
        >
          Uso por Pet
        </Button>
        <Button
          variant={activeTab === "usage-by-clinic" ? "default" : "ghost"}
          onClick={() => setActiveTab("usage-by-clinic")}
          className="rounded-b-none"
        >
          Uso por Clínica
        </Button>
        <Button
          variant={activeTab === "monthly-billing" ? "default" : "ghost"}
          onClick={() => setActiveTab("monthly-billing")}
          className="rounded-b-none"
        >
          Faturamento Mensal
        </Button>
      </div>
      <div>
        {activeTab === "usage-by-pet" && <UsageByPetReport />}
        {activeTab === "usage-by-clinic" && <UsageByClinicReport />}
        {activeTab === "monthly-billing" && <MonthlyBillingReport />}
      </div>
    </div>
  );
}

