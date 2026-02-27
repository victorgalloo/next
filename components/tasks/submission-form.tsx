"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SubmissionFormProps {
  taskId: string;
}

export function SubmissionForm({ taskId }: SubmissionFormProps) {
  const { user } = useUser();

  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      toast.error("No se pudo obtener tu sesion. Intenta recargar la pagina.");
      return;
    }

    if (!content.trim()) {
      toast.error("Escribe el contenido de tu entrega.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.from("task_submissions").insert({
      task_id: taskId,
      student_id: user.id,
      content: content.trim(),
      file_url: fileUrl.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Error al enviar tu entrega. Intenta de nuevo.");
      return;
    }

    toast.success("Entrega enviada exitosamente.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Entregar tarea</CardTitle>
        <CardDescription>
          Escribe tu respuesta y opcionalmente incluye un enlace a tu archivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Content */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Respuesta</Label>
            <Textarea
              id="content"
              placeholder="Escribe tu respuesta aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          {/* File URL */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="file_url">
              Enlace al archivo{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="file_url"
              type="url"
              placeholder="https://drive.google.com/..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Enviando..." : "Enviar entrega"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
