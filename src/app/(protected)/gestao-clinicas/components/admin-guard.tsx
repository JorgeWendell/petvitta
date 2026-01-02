"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
          router.push("/dashboard");
          return;
        }

        if (data.permissions.role !== "ADMIN") {
          toast.error("Acesso negado. Apenas administradores podem acessar esta página");
          router.push("/dashboard");
          return;
        }

        if (!data.permissions.isActive) {
          toast.error("Sua conta está inativa");
          router.push("/authentication");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        toast.error("Erro ao verificar permissões");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

