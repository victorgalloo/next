"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, AlertTriangle, Users, ClipboardList } from "lucide-react";

type Stats = {
  reportsThisMonth: number;
  activeAlerts: number;
  totalStudents: number;
  totalTasks: number;
};

export function StatsCards({ schoolId }: { schoolId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [reports, alerts, students, tasks] = await Promise.all([
        supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .gte("created_at", firstOfMonth),
        supabase
          .from("panic_alerts")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("status", "activa"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("role", "alumno"),
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId),
      ]);

      setStats({
        reportsThisMonth: reports.count ?? 0,
        activeAlerts: alerts.count ?? 0,
        totalStudents: students.count ?? 0,
        totalTasks: tasks.count ?? 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Reportes del mes",
      value: stats.reportsThisMonth,
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "Alertas activas",
      value: stats.activeAlerts,
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      color: "text-red-600",
    },
    {
      title: "Alumnos",
      value: stats.totalStudents,
      icon: <Users className="h-5 w-5 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "Tareas",
      value: stats.totalTasks,
      icon: <ClipboardList className="h-5 w-5 text-purple-600" />,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
