"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import type { Task } from "@/lib/types/database";
import { TaskCard } from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function TareasPage() {
  const { user, profile, loading: userLoading } = useUser();

  const [tasks, setTasks] = useState<(Task & { teacher_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !profile || !user) return;

    async function fetchTasks() {
      const supabase = createClient();
      let query = supabase
        .from("tasks")
        .select("*, profiles!tasks_teacher_id_fkey(full_name)")
        .order("due_date", { ascending: false });

      switch (profile!.role) {
        case "alumno":
          query = query
            .eq("school_id", profile!.school_id)
            .eq("grade", profile!.grade!);
          break;
        case "padre": {
          // Get children's grades
          const { data: relations } = await supabase
            .from("parent_students")
            .select("student_id")
            .eq("parent_id", user!.id);

          if (relations && relations.length > 0) {
            const studentIds = relations.map((r) => r.student_id);
            const { data: studentProfiles } = await supabase
              .from("profiles")
              .select("grade")
              .in("id", studentIds);

            const grades = [
              ...new Set(
                (studentProfiles ?? [])
                  .map((p) => p.grade)
                  .filter(Boolean) as string[]
              ),
            ];

            if (grades.length > 0) {
              query = query
                .eq("school_id", profile!.school_id)
                .in("grade", grades);
            } else {
              setTasks([]);
              setLoading(false);
              return;
            }
          } else {
            setTasks([]);
            setLoading(false);
            return;
          }
          break;
        }
        case "maestro":
          query = query.eq("teacher_id", user!.id);
          break;
        case "director":
          query = query.eq("school_id", profile!.school_id);
          break;
      }

      const { data } = await query;

      const mapped = (data ?? []).map((t) => {
        const { profiles, ...task } = t as Task & {
          profiles: { full_name: string } | null;
        };
        return {
          ...task,
          teacher_name: profiles?.full_name ?? undefined,
        };
      });

      setTasks(mapped);
      setLoading(false);
    }

    fetchTasks();
  }, [user, profile, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
        {profile?.role === "maestro" && (
          <Button asChild>
            <Link href="/tareas/nueva">
              <Plus />
              Nueva tarea
            </Link>
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">No hay tareas por mostrar.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              teacherName={task.teacher_name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
