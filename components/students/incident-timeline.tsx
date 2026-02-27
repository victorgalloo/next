"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  INCIDENT_TYPE_LABELS,
  SEVERITY_LABELS,
  type IncidentType,
  type Severity,
} from "@/lib/constants";
import type { Incident } from "@/lib/types/database";

const SEVERITY_COLORS: Record<Severity, string> = {
  leve: "bg-yellow-100 text-yellow-800 border-yellow-300",
  moderado: "bg-orange-100 text-orange-800 border-orange-300",
  grave: "bg-red-100 text-red-800 border-red-300",
};

const TYPE_COLORS: Record<IncidentType, string> = {
  conducta: "bg-blue-100 text-blue-800 border-blue-300",
  academico: "bg-purple-100 text-purple-800 border-purple-300",
  asistencia: "bg-gray-100 text-gray-800 border-gray-300",
  positivo: "bg-green-100 text-green-800 border-green-300",
};

type IncidentWithCreator = Incident & {
  creator_name: string;
};

export function IncidentTimeline({ studentId }: { studentId: string }) {
  const [incidents, setIncidents] = useState<IncidentWithCreator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: incidentData } = await supabase
      .from("incidents")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (!incidentData || incidentData.length === 0) {
      setIncidents([]);
      setLoading(false);
      return;
    }

    const creatorIds = [...new Set(incidentData.map((i) => i.created_by))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", creatorIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.full_name])
    );

    const withCreators: IncidentWithCreator[] = incidentData.map((incident) => ({
      ...incident,
      creator_name: profileMap.get(incident.created_by) ?? "Desconocido",
    }));

    setIncidents(withCreators);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-3 w-3 rounded-full mt-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No hay incidentes registrados para este alumno.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

      {incidents.map((incident) => (
        <div key={incident.id} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="relative z-10 mt-2 h-3.5 w-3.5 rounded-full border-2 border-background bg-muted-foreground shrink-0" />

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={TYPE_COLORS[incident.type]}
                variant="outline"
              >
                {INCIDENT_TYPE_LABELS[incident.type]}
              </Badge>
              <Badge
                className={SEVERITY_COLORS[incident.severity]}
                variant="outline"
              >
                {SEVERITY_LABELS[incident.severity]}
              </Badge>
            </div>

            <p className="text-sm">{incident.description}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>Por: {incident.creator_name}</span>
              <span>
                {new Date(incident.created_at).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
