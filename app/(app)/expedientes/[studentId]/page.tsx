"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { StudentRecord } from "@/components/students/student-record";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ROLES,
  INCIDENT_TYPE_LABELS,
  SEVERITY_LABELS,
  type IncidentType,
  type Severity,
} from "@/lib/constants";

export default function StudentDetailPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const { user, profile } = useUser();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<IncidentType | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const canRegisterIncident =
    profile?.role === ROLES.MAESTRO || profile?.role === ROLES.DIRECTOR;

  const handleSubmit = useCallback(async () => {
    if (!type || !severity || !description.trim()) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }

    if (!user || !profile) {
      toast.error("No se pudo obtener la informacion del usuario.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from("incidents").insert({
      student_id: studentId,
      created_by: user.id,
      school_id: profile.school_id,
      type,
      severity,
      description: description.trim(),
    });

    setSubmitting(false);

    if (error) {
      toast.error("Error al registrar el incidente.");
      return;
    }

    toast.success("Incidente registrado correctamente.");
    setOpen(false);
    setType("");
    setSeverity("");
    setDescription("");
    setRefreshKey((k) => k + 1);
  }, [type, severity, description, user, profile, studentId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div />
        {canRegisterIncident && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Registrar incidente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar incidente</DialogTitle>
                <DialogDescription>
                  Registra un nuevo incidente para el expediente del alumno.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incident-type">Tipo de incidente</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v as IncidentType)}
                  >
                    <SelectTrigger id="incident-type" className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(INCIDENT_TYPE_LABELS) as [
                          IncidentType,
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident-severity">Severidad</Label>
                  <Select
                    value={severity}
                    onValueChange={(v) => setSeverity(v as Severity)}
                  >
                    <SelectTrigger id="incident-severity" className="w-full">
                      <SelectValue placeholder="Selecciona la severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(SEVERITY_LABELS) as [Severity, string][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident-description">Descripcion</Label>
                  <Textarea
                    id="incident-description"
                    placeholder="Describe el incidente..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Registrando..." : "Registrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <StudentRecord key={refreshKey} studentId={studentId} />
    </div>
  );
}
