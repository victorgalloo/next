"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import type { Report } from "@/lib/types/database";
import {
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/constants";
import { formatRelative, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, EyeOff, MapPin, Calendar } from "lucide-react";

const STATUS_COLORS: Record<ReportStatus, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  en_revision: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resuelto: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  descartado: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  bullying: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  verbal: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  fisico: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  sexual: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ciberacoso: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  robo: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  otro: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

export default function ReporteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { profile, loading: userLoading } = useUser();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("id", params.id)
        .single();

      setReport(data);
      setLoading(false);
    }

    fetchReport();
  }, [params.id]);

  async function handleStatusChange(newStatus: string) {
    if (!report) return;

    setUpdatingStatus(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", report.id);

    setUpdatingStatus(false);

    if (error) {
      toast.error("Error al actualizar el estado del reporte.");
      return;
    }

    setReport({ ...report, status: newStatus as Report["status"] });
    toast.success("Estado del reporte actualizado.");
  }

  if (loading || userLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-muted-foreground">Reporte no encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/reportes")}>
          <ArrowLeft />
          Volver a reportes
        </Button>
      </div>
    );
  }

  const isStaff =
    profile?.role === "maestro" || profile?.role === "director";
  const statusLabel =
    REPORT_STATUS_LABELS[report.status as ReportStatus] ?? report.status;
  const categoryLabel =
    REPORT_CATEGORY_LABELS[report.category as ReportCategory] ?? report.category;
  const statusColor = STATUS_COLORS[report.status as ReportStatus] ?? "";
  const categoryColor =
    CATEGORY_COLORS[report.category as ReportCategory] ?? "";

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => router.push("/reportes")}
      >
        <ArrowLeft />
        Volver a reportes
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{report.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                {formatDate(report.created_at)}
                <span className="text-xs">
                  ({formatRelative(report.created_at)})
                </span>
              </CardDescription>
            </div>
            {report.is_anonymous && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
                <EyeOff className="size-3.5" />
                Anonimo
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={categoryColor}>
              {categoryLabel}
            </Badge>
            <Badge variant="outline" className={statusColor}>
              {statusLabel}
            </Badge>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Descripcion</Label>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Location */}
          {report.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {report.location}
            </div>
          )}

          {/* Status update for staff */}
          {isStaff && (
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Label>Actualizar estado</Label>
              <Select
                value={report.status}
                onValueChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updatingStatus && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Actualizando...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
