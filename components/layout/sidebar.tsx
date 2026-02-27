"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  AlertTriangle,
  FileText,
  FolderOpen,
  ClipboardList,
  Bell,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/constants";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
};

const navItems: NavItem[] = [
  {
    href: "/inicio",
    label: "Inicio",
    icon: <Home className="h-5 w-5" />,
    roles: ["alumno", "padre", "maestro", "director"],
  },
  {
    href: "/boton-panico",
    label: "Botón de pánico",
    icon: <AlertTriangle className="h-5 w-5" />,
    roles: ["alumno"],
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: <FileText className="h-5 w-5" />,
    roles: ["alumno", "maestro", "director"],
  },
  {
    href: "/expedientes",
    label: "Expedientes",
    icon: <FolderOpen className="h-5 w-5" />,
    roles: ["padre", "maestro", "director"],
  },
  {
    href: "/tareas",
    label: "Tareas",
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ["alumno", "padre", "maestro", "director"],
  },
  {
    href: "/notificaciones",
    label: "Notificaciones",
    icon: <Bell className="h-5 w-5" />,
    roles: ["alumno", "padre", "maestro", "director"],
  },
  {
    href: "/panel",
    label: "Panel",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["director"],
  },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r min-h-screen">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">🛡️ EscudoEscolar</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
