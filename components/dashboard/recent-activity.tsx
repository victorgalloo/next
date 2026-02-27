"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/lib/utils";
import {
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  PANIC_STATUS_LABELS,
  type ReportCategory,
  type ReportStatus,
  type PanicStatus,
} from "@/lib/constants";
import type { Report, PanicAlert } from "@/lib/types/database";
import Link from "next/link";

export function RecentActivity({ schoolId }: { schoolId: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [alerts, setAlerts] = useState<(PanicAlert & { student_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      const supabase = createClient();

      const [reportsRes, alertsRes] = await Promise.all([
        supabase
          .from("reports")
          .select("*")
          .eq("school_id", schoolId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("panic_alerts")
          .select("*, profiles!panic_alerts_student_id_fkey(full_name)")
          .eq("school_id", schoolId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (reportsRes.data) setReports(reportsRes.data);
      if (alertsRes.data) {
        setAlerts(
          alertsRes.data.map((a: Record<string, unknown>) => ({
            ...(a as unknown as PanicAlert),
            student_name: (a.profiles as { full_name: string } | null)?.full_name,
          }))
        );
      }
      setLoading(false);
    }

    fetchActivity();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statusColors: Record<ReportStatus, string> = {
    pendiente: "bg-yellow-100 text-yellow-800",
    en_revision: "bg-blue-100 text-blue-800",
    resuelto: "bg-green-100 text-green-800",
    descartado: "bg-gray-100 text-gray-800",
  };

  const alertStatusColors: Record<PanicStatus, string> = {
    activa: "bg-red-100 text-red-800",
    atendida: "bg-green-100 text-green-800",
    falsa_alarma: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reportes recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-gray-500">Sin reportes recientes</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <Link
                  key={r.id}
                  href={`/reportes/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-xs text-gray-500">
                      {REPORT_CATEGORY_LABELS[r.category as ReportCategory]} &middot;{" "}
                      {formatRelative(r.created_at)}
                    </p>
                  </div>
                  <Badge
                    className={statusColors[r.status as ReportStatus]}
                    variant="secondary"
                  >
                    {REPORT_STATUS_LABELS[r.status as ReportStatus]}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alertas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500">Sin alertas recientes</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {a.student_name || "Alumno"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.message || "Sin mensaje"} &middot;{" "}
                      {formatRelative(a.created_at)}
                    </p>
                  </div>
                  <Badge
                    className={alertStatusColors[a.status as PanicStatus]}
                    variant="secondary"
                  >
                    {PANIC_STATUS_LABELS[a.status as PanicStatus]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
