import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["alumno", "padre", "maestro", "director"]),
  school_id: z.string().uuid("Escuela inválida"),
  grade: z.string().optional(),
});

export const reportSchema = z.object({
  is_anonymous: z.boolean(),
  category: z.enum([
    "bullying",
    "verbal",
    "fisico",
    "sexual",
    "ciberacoso",
    "robo",
    "otro",
  ]),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  location: z.string().optional(),
  involved_student_ids: z.array(z.string().uuid()).optional(),
});

export const panicAlertSchema = z.object({
  message: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const incidentSchema = z.object({
  student_id: z.string().uuid("Alumno inválido"),
  type: z.enum(["conducta", "academico", "asistencia", "positivo"]),
  severity: z.enum(["leve", "moderado", "grave"]),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
});

export const taskSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(5, "Las instrucciones deben tener al menos 5 caracteres"),
  grade: z.string().min(1, "El grado es requerido"),
  due_date: z.string().min(1, "La fecha límite es requerida"),
});

export const taskSubmissionSchema = z.object({
  content: z.string().min(1, "El contenido es requerido"),
  file_url: z.string().url().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type PanicAlertInput = z.infer<typeof panicAlertSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type TaskSubmissionInput = z.infer<typeof taskSubmissionSchema>;
