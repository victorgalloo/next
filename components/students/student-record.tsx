"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IncidentTimeline } from "@/components/students/incident-timeline";
import { REPORT_CATEGORY_LABELS, REPORT_STATUS_LABELS } from "@/lib/constants";
import type { Profile, Report, Task, TaskSubmission } from "@/lib/types/database";

type SubmissionWithTask = TaskSubmission & {
  task: Pick<Task, "title" | "description" | "due_date"> | null;
};

export function StudentRecord({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<Profile | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [submissions, setSubmissions] = useState<SubmissionWithTask[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch student profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", studentId)
      .single();

    setStudent(profile);

    if (profile) {
      // Fetch school name
      const { data: school } = await supabase
        .from("schools")
        .select("name")
        .eq("id", profile.school_id)
        .single();

      setSchoolName(school?.name ?? "");

      // Fetch task submissions with task info
      const { data: submissionData } = await supabase
        .from("task_submissions")
        .select("*, task:tasks(title, description, due_date)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      setSubmissions((submissionData as SubmissionWithTask[]) ?? []);

      // Fetch reports where student is involved
      const { data: reportData } = await supabase
        .from("reports")
        .select("*")
        .contains("involved_student_ids", [studentId])
        .order("created_at", { ascending: false });

      setReports(reportData ?? []);
    }

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No se encontro el alumno.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{student.full_name}</h2>
        <p className="text-muted-foreground text-sm">Expediente del alumno</p>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informacion</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informacion del alumno</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Nombre completo
                  </dt>
                  <dd className="text-sm mt-1">{student.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Grado
                  </dt>
                  <dd className="text-sm mt-1">
                    {student.grade ?? "Sin asignar"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Escuela
                  </dt>
                  <dd className="text-sm mt-1">
                    {schoolName || "Sin escuela"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Fecha de registro
                  </dt>
                  <dd className="text-sm mt-1">
                    {new Date(student.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de incidentes</CardTitle>
            </CardHeader>
            <CardContent>
              <IncidentTimeline studentId={studentId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Entregas de tareas</CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-center py-4 text-sm text-muted-foreground">
                  No hay entregas de tareas registradas.
                </p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium">
                          {sub.task?.title ?? "Tarea eliminada"}
                        </h4>
                        {sub.grade_score !== null && (
                          <Badge variant="secondary">
                            Calificacion: {sub.grade_score}
                          </Badge>
                        )}
                      </div>
                      {sub.task?.description && (
                        <p className="text-xs text-muted-foreground">
                          {sub.task.description}
                        </p>
                      )}
                      <p className="text-sm">{sub.content}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {sub.task?.due_date && (
                          <span>
                            Fecha limite:{" "}
                            {new Date(sub.task.due_date).toLocaleDateString(
                              "es-MX"
                            )}
                          </span>
                        )}
                        <span>
                          Entregado:{" "}
                          {new Date(sub.created_at).toLocaleDateString("es-MX")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-center py-4 text-sm text-muted-foreground">
                  No hay reportes relacionados con este alumno.
                </p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium">{report.title}</h4>
                        <Badge variant="outline">
                          {REPORT_STATUS_LABELS[report.status]}
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {REPORT_CATEGORY_LABELS[report.category]}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString(
                          "es-MX",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
