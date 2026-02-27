"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PanicButton() {
  const { profile, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!profile) {
      toast.error("No se pudo obtener tu perfil. Intenta recargar la pagina.");
      return;
    }

    setSubmitting(true);

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch {
      // Geolocation denied or unavailable — continue without it
    }

    const supabase = createClient();

    const { error } = await supabase.from("panic_alerts").insert({
      student_id: profile.id,
      school_id: profile.school_id,
      message: message.trim() || null,
      latitude,
      longitude,
      status: "activa",
    });

    setSubmitting(false);

    if (error) {
      toast.error("Error al enviar la alerta. Intenta de nuevo.");
      return;
    }

    toast.success("Alerta enviada. Ayuda esta en camino.");
    setOpen(false);
    setMessage("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Presiona el boton si necesitas ayuda urgente. Se notificara al
          personal de tu escuela.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative flex items-center justify-center w-52 h-52 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 active:scale-95 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400"
        >
          {/* Animated pulse ring */}
          <span className="absolute inset-0 rounded-full bg-red-500 animate-[panic-pulse_2s_ease-in-out_infinite]" />

          <span className="relative z-10 flex flex-col items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Bell / alarm icon */}
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              <line x1="12" y1="2" x2="12" y2="4" />
            </svg>
            <span className="text-2xl font-bold tracking-wide uppercase">
              S.O.S.
            </span>
          </span>
        </button>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar alerta de panico</DialogTitle>
            <DialogDescription>
              Se enviara una alerta al personal de tu escuela con tu ubicacion.
              Opcionalmente puedes agregar un mensaje.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Describe brevemente lo que sucede (opcional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Enviar alerta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
