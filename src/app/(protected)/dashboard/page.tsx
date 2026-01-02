"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

import { AdminDashboard } from "./components/admin-dashboard";
import { ClinicDashboard } from "./components/clinic-dashboard";
import { MonthYearPicker } from "./components/month-year-picker";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"ADMIN" | "CLINIC" | null>(null);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const session = await authClient.getSession();

        if (!session?.data?.user) {
          toast.error("Você precisa estar autenticado");
          router.push("/authentication");
          return;
        }

        const response = await fetch("/api/user-permissions");
        const data = await response.json();

        if (!response.ok || !data.permissions) {
          toast.error("Erro ao verificar permissões");
          router.push("/authentication");
          return;
        }

        if (!data.permissions.isActive) {
          toast.error("Sua conta está inativa");
          router.push("/authentication");
          return;
        }

        const role = data.permissions.role;
        if (role !== "ADMIN" && role !== "CLINIC") {
          toast.error("Acesso negado. Apenas administradores e clínicas podem acessar o dashboard");
          router.push("/authentication");
          return;
        }

        setUserRole(role);
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        toast.error("Erro ao verificar permissões");
        router.push("/authentication");
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {userRole === "ADMIN"
              ? "Visão geral do sistema"
              : "Visão geral da sua clínica"}
          </p>
        </div>
        <MonthYearPicker
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </div>
      {userRole === "ADMIN" ? (
        <AdminDashboard selectedMonth={selectedMonth} selectedYear={selectedYear} />
      ) : (
        <ClinicDashboard selectedMonth={selectedMonth} selectedYear={selectedYear} />
      )}
    </div>
  );
}

