import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Calendar,
  Target,
  Settings,
  Sparkles,
  Bot,
  ArrowRightLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurrencyConverter from "./CurrencyConverter";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentSpace: 'personal' | 'business';
}

const personalMenuItems = [
  {
    id: "dashboard",
    title: "Дашборд",
    icon: LayoutDashboard,
  },
  {
    id: "money-accounts",
    title: "Деньги и счета",
    icon: Wallet,
  },
  {
    id: "goals-savings",
    title: "Цели и накопления",
    icon: Target,
  },
  {
    id: "planner",
    title: "Платежи",
    icon: Calendar,
  },
];

const businessMenuItems = [
  {
    id: "dashboard",
    title: "Дашборд",
    icon: LayoutDashboard,
  },
  {
    id: "finances",
    title: "Финансы",
    icon: Wallet,
  },
  {
    id: "services",
    title: "Услуги",
    icon: Target,
  },
];

const toolsItems = [
  {
    id: "ai-assistant",
    title: "AI помощник",
    icon: Bot,
  },
  {
    id: "converter",
    title: "Конвертер",
    icon: ArrowRightLeft,
  },
  {
    id: "settings",
    title: "Настройки",
    icon: Settings,
  },
];

export function AppSidebar({ activeTab, onTabChange, currentSpace }: AppSidebarProps) {
  const menuItems = currentSpace === 'personal' ? personalMenuItems : businessMenuItems;

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-bold text-foreground">
              {currentSpace === 'personal' ? 'Личные финансы' : 'Бизнес'}
            </h2>
            <p className="text-xs text-muted-foreground">Энергия денег</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    data-testid={`sidebar-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Инструменты</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    data-testid={`sidebar-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {activeTab === 'converter' && (
          <div className="px-4 pb-4">
            <CurrencyConverter />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Создано для Нины</p>
          <p className="text-primary">✨ Деньги — это энергия</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
