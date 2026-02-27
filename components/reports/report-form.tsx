"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import {
  REPORT_CATEGORY_LABELS,
  type ReportCategory,
} from "@/lib/constants";
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

export function ReportForm() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!profile) {
      toast.error("No se pudo obtener tu perfil. Intenta recargar la pagina.");
      return;
    }

    if (!category) {
      toast.error("Selecciona una categoria.");
      return;
    }

    if (!title.trim()) {
      toast.error("Escribe un titulo para el reporte.");
      return;
    }

    if (!description.trim()) {
      toast.error("Escribe una descripcion del incidente.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.from("reports").insert({
      reporter_id: isAnonymous ? null : user!.id,
      is_anonymous: isAnonymous,
      category,
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || null,
      school_id: profile.school_id,
      status: "pendiente",
    });

    setSubmitting(false);

    if (error) {
      toast.error("Error al crear el reporte. Intenta de nuevo.");
      return;
    }

    toast.success("Reporte creado exitosamente.");
    router.push("/reportes");
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
        <CardTitle>Nuevo reporte</CardTitle>
        <CardDescription>
          Describe el incidente que deseas reportar. Puedes hacerlo de forma
          anonima si lo prefieres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Anonymous toggle */}
          <div className="flex items-center gap-3">
            <input
              id="is_anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="is_anonymous" className="cursor-pointer">
              Enviar de forma anonima
            </Label>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ReportCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              placeholder="Titulo breve del incidente"
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
              placeholder="Describe lo que sucedio con el mayor detalle posible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">
              Ubicacion <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="location"
              placeholder="Ej. Patio trasero, Salon 3B, Cancha..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Enviando..." : "Enviar reporte"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
