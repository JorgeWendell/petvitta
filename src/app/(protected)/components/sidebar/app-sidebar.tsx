"use client";

import {
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  PawPrint,
  Stethoscope,
  Sun,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

import { NavMain } from "./nav-main";

// Menu para ADMIN
const adminMenu = {
  navMain: [
    {
      label: "Menu",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Gestão de Usuários",
          url: "/gestao-usuarios",
          icon: Users,
        },
        {
          title: "Gestão de Pets",
          icon: PawPrint,
          url: "/gestao-pets",
        },
        {
          title: "Gestão de Planos",
          icon: CreditCard,
          url: "/gestao-planos",
        },
        {
          title: "Gestão de Clínicas",
          icon: Stethoscope,
          url: "/gestao-clinicas",
        },
        {
          title: "Gestão Financeira",
          icon: Wallet,
          url: "/gestao-financeiro",
        },
        {
          title: "Relatórios",
          icon: FileText,
          url: "/gestao-relatorios",
        },
      ],
    },
  ],
};

// Menu para CLINIC
const clinicMenu = {
  navMain: [
    {
      label: "Menu",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Cadastro de Veterinários",
          url: "/cadastro-veterinarios",
          icon: UserPlus,
        },
        {
          title: "Consultas",
          url: "/consultas",
          icon: Stethoscope,
          items: [
            {
              title: "Consultas de Hoje",
              url: "/consultas",
            },
            {
              title: "Histórico de Consultas",
              url: "/historico-consultas",
            },
          ],
        },
        {
          title: "Agendamentos",
          url: "/agendamentos",
          icon: CalendarDays,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [userRole, setUserRole] = React.useState<"ADMIN" | "CLINIC" | null>(
    null,
  );
  const [isLoadingRole, setIsLoadingRole] = React.useState(true);

  const session = authClient.useSession();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/user-permissions");
        const data = await response.json();

        if (response.ok && data.permissions) {
          const role = data.permissions.role;
          if (role === "ADMIN" || role === "CLINIC") {
            setUserRole(role);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar role do usuário:", error);
      } finally {
        setIsLoadingRole(false);
      }
    };

    fetchUserRole();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Seleciona o menu baseado no role do usuário
  const menuData = userRole === "CLINIC" ? clinicMenu : adminMenu;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <Image
        src="/side.png"
        alt="Logo"
        width={150}
        height={150}
        className="mx-auto mt-4"
      />
      <SidebarContent>
        {!isLoadingRole && <NavMain groups={menuData.navMain} />}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback>
                      {session.data?.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{session.data?.user.name}</p>

                    <p className="text-muted-foreground text-sm">
                      {session.data?.user.name}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={toggleTheme}>
                  {mounted && theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Modo Claro
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Modo Escuro
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
