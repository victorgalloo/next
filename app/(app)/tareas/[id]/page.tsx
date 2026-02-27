"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import type { Task, TaskSubmission } from "@/lib/types/database";
import { formatDate, formatRelative } from "@/lib/utils";
import { SubmissionForm } from "@/components/tasks/submission-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, AlertTriangle, ExternalLink } from "lucide-react";

type SubmissionWithStudent = TaskSubmission & {
  student_name?: string;
};

export default function TareaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile, loading: userLoading } = useUser();

  const [task, setTask] = useState<Task | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Student-specific state
  const [mySubmission, setMySubmission] = useState<TaskSubmission | null>(null);
  const [checkingSubmission, setCheckingSubmission] = useState(true);

  // Teacher/director-specific state
  const [submissions, setSubmissions] = useState<SubmissionWithStudent[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [savingGrade, setSavingGrade] = useState(false);

  // Fetch task
  useEffect(() => {
    async function fetchTask() {
      const supabase = createClient();

      const { data } = await supabase
        .from("tasks")
        .select("*, profiles!tasks_teacher_id_fkey(full_name)")
        .eq("id", params.id)
        .single();

      if (data) {
        const { profiles, ...taskData } = data as Task & {
          profiles: { full_name: string } | null;
        };
        setTask(taskData);
        setTeacherName(profiles?.full_name ?? null);
      }

      setLoading(false);
    }

    fetchTask();
  }, [params.id]);

  // Fetch submissions based on role
  useEffect(() => {
    if (userLoading || !user || !profile || !task) return;

    async function fetchSubmissions() {
      const supabase = createClient();

      if (profile!.role === "alumno") {
        // Check if this student already submitted
        const { data } = await supabase
          .from("task_submissions")
          .select("*")
          .eq("task_id", task!.id)
          .eq("student_id", user!.id)
          .maybeSingle();

        setMySubmission(data ?? null);
        setCheckingSubmission(false);
      } else if (
        profile!.role === "maestro" ||
        profile!.role === "director"
      ) {
        // Fetch all submissions with student names
        const { data } = await supabase
          .from("task_submissions")
          .select("*, profiles!task_submissions_student_id_fkey(full_name)")
          .eq("task_id", task!.id)
          .order("created_at", { ascending: true });

        const mapped = (data ?? []).map((s) => {
          const { profiles, ...submission } = s as TaskSubmission & {
            profiles: { full_name: string } | null;
          };
          return {
            ...submission,
            student_name: profiles?.full_name ?? undefined,
          };
        });

        setSubmissions(mapped);
        setCheckingSubmission(false);
      } else {
        setCheckingSubmission(false);
      }
    }

    fetchSubmissions();
  }, [user, profile, userLoading, task]);

  async function handleSaveGrade(submissionId: string) {
    const scoreStr = gradeInputs[submissionId];
    if (scoreStr === undefined || scoreStr === "") {
      toast.error("Ingresa una calificacion.");
      return;
    }

    const score = Number(scoreStr);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("La calificacion debe ser un numero entre 0 y 100.");
      return;
    }

    setSavingGrade(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("task_submissions")
      .update({ grade_score: score })
      .eq("id", submissionId);

    setSavingGrade(false);

    if (error) {
      toast.error("Error al guardar la calificacion.");
      return;
    }

    // Update local state
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, grade_score: score } : s
      )
    );
    setGradingId(null);
    toast.success("Calificacion guardada.");
  }

  if (loading || userLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-muted-foreground">Tarea no encontrada.</p>
        <Button variant="outline" onClick={() => router.push("/tareas")}>
          <ArrowLeft />
          Volver a tareas
        </Button>
      </div>
    );
  }

  const isOverdue = new Date(task.due_date) < new Date();
  const isStaff =
    profile?.role === "maestro" || profile?.role === "director";

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => router.push("/tareas")}
      >
        <ArrowLeft />
        Volver a tareas
      </Button>

      {/* Task detail card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{task.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                Entrega: {formatDate(task.due_date)}
                <span className="text-xs">
                  ({formatRelative(task.due_date)})
                </span>
              </CardDescription>
            </div>
            {isOverdue && (
              <div className="flex items-center gap-1 text-red-500 text-xs shrink-0">
                <AlertTriangle className="size-3.5" />
                Vencida
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            >
              {task.grade}
            </Badge>
            {isOverdue ? (
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              >
                Vencida
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              >
                Vigente
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">
              Descripcion
            </Label>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Teacher name */}
          {teacherName && (
            <div className="text-sm text-muted-foreground">
              Maestro: {teacherName}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student: submission or form */}
      {profile?.role === "alumno" && !checkingSubmission && (
        <>
          {mySubmission ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tu entrega</CardTitle>
                <CardDescription>
                  Enviada {formatRelative(mySubmission.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm whitespace-pre-wrap">
                  {mySubmission.content}
                </p>
                {mySubmission.file_url && (
                  <a
                    href={mySubmission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary underline"
                  >
                    <ExternalLink className="size-3.5" />
                    Ver archivo adjunto
                  </a>
                )}
                {mySubmission.grade_score !== null && (
                  <div className="pt-2 border-t">
                    <span className="text-sm font-medium">
                      Calificacion:{" "}
                    </span>
                    <Badge variant="outline">{mySubmission.grade_score}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <SubmissionForm taskId={task.id} />
          )}
        </>
      )}

      {/* Teacher/Director: list of submissions */}
      {isStaff && !checkingSubmission && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">
            Entregas ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aun no hay entregas para esta tarea.
            </p>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {submission.student_name ?? "Alumno"}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(submission.created_at)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm whitespace-pre-wrap">
                    {submission.content}
                  </p>

                  {submission.file_url && (
                    <a
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary underline"
                    >
                      <ExternalLink className="size-3.5" />
                      Ver archivo adjunto
                    </a>
                  )}

                  {/* Grade section */}
                  <div className="flex items-center gap-3 pt-2 border-t">
                    {submission.grade_score !== null &&
                    gradingId !== submission.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Calificacion:
                        </span>
                        <Badge variant="outline">
                          {submission.grade_score}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setGradingId(submission.id);
                            setGradeInputs((prev) => ({
                              ...prev,
                              [submission.id]: String(
                                submission.grade_score ?? ""
                              ),
                            }));
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`grade-${submission.id}`}
                          className="text-sm shrink-0"
                        >
                          Calificacion:
                        </Label>
                        <Input
                          id={`grade-${submission.id}`}
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0-100"
                          className="w-24"
                          value={gradeInputs[submission.id] ?? ""}
                          onChange={(e) =>
                            setGradeInputs((prev) => ({
                              ...prev,
                              [submission.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          disabled={savingGrade}
                          onClick={() => handleSaveGrade(submission.id)}
                        >
                          {savingGrade ? "Guardando..." : "Guardar"}
                        </Button>
                        {gradingId === submission.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setGradingId(null)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
