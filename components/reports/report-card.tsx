"use client";

import Link from "next/link";
import type { Report } from "@/lib/types/database";
import {
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/constants";
import { formatRelative } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EyeOff } from "lucide-react";

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

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const statusLabel =
    REPORT_STATUS_LABELS[report.status as ReportStatus] ?? report.status;
  const categoryLabel =
    REPORT_CATEGORY_LABELS[report.category as ReportCategory] ?? report.category;
  const statusColor =
    STATUS_COLORS[report.status as ReportStatus] ?? "";
  const categoryColor =
    CATEGORY_COLORS[report.category as ReportCategory] ?? "";

  return (
    <Link href={`/reportes/${report.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-1">
              {report.title}
            </CardTitle>
            {report.is_anonymous && (
              <EyeOff className="size-4 text-muted-foreground shrink-0" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={categoryColor}>
              {categoryLabel}
            </Badge>
            <Badge variant="outline" className={statusColor}>
              {statusLabel}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatRelative(report.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
