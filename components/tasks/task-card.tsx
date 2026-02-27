"use client";

import Link from "next/link";
import type { Task } from "@/lib/types/database";
import { formatRelative } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  teacherName?: string;
}

export function TaskCard({ task, teacherName }: TaskCardProps) {
  const isOverdue = new Date(task.due_date) < new Date();

  return (
    <Link href={`/tareas/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-1">
              {task.title}
            </CardTitle>
            {isOverdue && (
              <AlertTriangle className="size-4 text-red-500 shrink-0" />
            )}
          </div>
        </CardHeader>
        <CardContent>
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
            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar className="size-3" />
              {formatRelative(task.due_date)}
            </span>
          </div>
          {teacherName && (
            <p className="text-xs text-muted-foreground mt-2">
              Maestro: {teacherName}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
