"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GRADE_OPTIONS = ["1°", "2°", "3°", "4°", "5°", "6°"];

export function TaskForm() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user || !profile) {
      toast.error("No se pudo obtener tu perfil. Intenta recargar la pagina.");
      return;
    }

    if (!title.trim()) {
      toast.error("Escribe un titulo para la tarea.");
      return;
    }

    if (!description.trim()) {
      toast.error("Escribe una descripcion de la tarea.");
      return;
    }

    if (!grade) {
      toast.error("Selecciona un grado.");
      return;
    }

    if (!dueDate) {
      toast.error("Selecciona una fecha de entrega.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.from("tasks").insert({
      teacher_id: user.id,
      school_id: profile.school_id,
      title: title.trim(),
      description: description.trim(),
      grade,
      due_date: dueDate,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Error al crear la tarea. Intenta de nuevo.");
      return;
    }

    toast.success("Tarea creada exitosamente.");
    router.push("/tareas");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva tarea</CardTitle>
        <CardDescription>
          Crea una nueva tarea para tus alumnos. Selecciona el grado y la fecha
          de entrega.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              placeholder="Titulo de la tarea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              placeholder="Describe la tarea, instrucciones y lo que se espera del alumno..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          {/* Grade */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="grade">Grado</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un grado" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="due_date">Fecha de entrega</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Creando..." : "Crear tarea"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
