"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  AlertTriangle,
  FileText,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/constants";

type MobileNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
};

const mobileItems: MobileNavItem[] = [
  {
    href: "/inicio",
    label: "Inicio",
    icon: <Home className="h-5 w-5" />,
    roles: ["alumno", "padre", "maestro", "director"],
  },
  {
    href: "/boton-panico",
    label: "Pánico",
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
    href: "/tareas",
    label: "Tareas",
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ["alumno", "padre", "maestro", "director"],
  },
  {
    href: "/panel",
    label: "Panel",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["director"],
  },
];

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const filteredItems = mobileItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex justify-around items-center h-16">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs",
                isActive ? "text-blue-600" : "text-gray-500"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
