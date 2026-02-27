"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { ReportList } from "@/components/reports/report-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ReportesPage() {
  const { profile } = useUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        {profile?.role === "alumno" && (
          <Button asChild>
            <Link href="/reportes/nuevo">
              <Plus />
              Nuevo reporte
            </Link>
          </Button>
        )}
      </div>

      <ReportList />
    </div>
  );
}
