"use client";

import { useUser } from "@/hooks/use-user";
import Link from "next/link";
import {
  AlertTriangle,
  FileText,
  FolderOpen,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/constants";

export default function InicioPage() {
  const { profile } = useUser();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {profile.full_name}
        </h1>
        <p className="text-gray-600">
          Bienvenido a EscudoEscolar &mdash; {ROLE_LABELS[profile.role]}
        </p>
      </div>

      {profile.role === "alumno" && <AlumnoHome />}
      {profile.role === "padre" && <PadreHome />}
      {profile.role === "maestro" && <MaestroHome />}
      {profile.role === "director" && <DirectorHome />}
    </div>
  );
}

function AlumnoHome() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link href="/boton-panico">
        <Card className="hover:shadow-md transition-shadow border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <CardTitle className="text-red-700">Botón de pánico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              Presiona en caso de emergencia. Se notificará a las autoridades
              de tu escuela.
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/reportes/nuevo">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <CardTitle>Reportar incidente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Reporta violencia escolar de forma anónima o con tu nombre.
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/tareas">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <ClipboardList className="h-8 w-8 text-green-600" />
            <CardTitle>Mis tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Revisa y entrega tus tareas pendientes.
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function PadreHome() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link href="/expedientes">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <FolderOpen className="h-8 w-8 text-purple-600" />
            <CardTitle>Expediente de mi hijo/a</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Consulta el expediente, incidentes y reportes de tu hijo/a.
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/tareas">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <ClipboardList className="h-8 w-8 text-green-600" />
            <CardTitle>Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Consulta las tareas asignadas a tu hijo/a.
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function MaestroHome() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link href="/reportes">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <CardTitle>Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Revisa los reportes de violencia de tu escuela.
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/expedientes">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <FolderOpen className="h-8 w-8 text-purple-600" />
            <CardTitle>Expedientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Consulta y registra incidentes en los expedientes de alumnos.
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/tareas/nueva">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <ClipboardList className="h-8 w-8 text-green-600" />
            <CardTitle>Crear tarea</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Crea una nueva tarea para los alumnos.
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function DirectorHome() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link href="/panel">
        <Card className="hover:shadow-md transition-shadow border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-blue-700">Panel de control</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-600">
              Estadísticas, alertas y reportes de tu escuela.
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/reportes">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <CardTitle>Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Gestiona los reportes de violencia escolar.
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/expedientes">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <FolderOpen className="h-8 w-8 text-purple-600" />
            <CardTitle>Expedientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Administra los expedientes de los alumnos.
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
