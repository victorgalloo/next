"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLES } from "@/lib/constants";
import type { Profile } from "@/lib/types/database";

export default function ExpedientesPage() {
  const { user, profile, loading: userLoading } = useUser();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    if (profile?.role === ROLES.PADRE) {
      // For parents: get only their children
      const { data: relations } = await supabase
        .from("parent_student")
        .select("student_id")
        .eq("parent_id", user!.id);

      if (relations && relations.length > 0) {
        const studentIds = relations.map((r) => r.student_id);
        const { data: studentProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", studentIds)
          .order("full_name");

        setStudents(studentProfiles ?? []);
      } else {
        setStudents([]);
      }
    } else {
      // For maestro/director: get all students in the school
      const { data: studentProfiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("school_id", profile!.school_id)
        .eq("role", ROLES.ALUMNO)
        .order("full_name");

      setStudents(studentProfiles ?? []);
    }

    setLoading(false);
  }, [profile, user]);

  useEffect(() => {
    if (!userLoading && profile) {
      fetchStudents();
    }
  }, [userLoading, profile, fetchStudents]);

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (userLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-full max-w-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expedientes</h1>
        <p className="text-muted-foreground text-sm">
          {profile?.role === ROLES.PADRE
            ? "Expedientes de tus hijos"
            : "Expedientes de los alumnos de la escuela"}
        </p>
      </div>

      <Input
        placeholder="Buscar alumno por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filteredStudents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            {search
              ? "No se encontraron alumnos con ese nombre."
              : "No hay alumnos registrados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Link
              key={student.id}
              href={`/expedientes/${student.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">
                    {student.full_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {student.grade ?? "Sin grado"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
