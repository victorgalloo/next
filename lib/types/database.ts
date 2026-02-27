export type Profile = {
  id: string;
  role: "alumno" | "padre" | "maestro" | "director";
  full_name: string;
  school_id: string;
  grade: string | null;
  created_at: string;
};

export type School = {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string | null;
  is_anonymous: boolean;
  category: "bullying" | "verbal" | "fisico" | "sexual" | "ciberacoso" | "robo" | "otro";
  title: string;
  description: string;
  location: string | null;
  status: "pendiente" | "en_revision" | "resuelto" | "descartado";
  involved_student_ids: string[] | null;
  school_id: string;
  created_at: string;
};

export type PanicAlert = {
  id: string;
  student_id: string;
  message: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "activa" | "atendida" | "falsa_alarma";
  attended_by: string | null;
  school_id: string;
  created_at: string;
};

export type Incident = {
  id: string;
  student_id: string;
  created_by: string;
  type: "conducta" | "academico" | "asistencia" | "positivo";
  severity: "leve" | "moderado" | "grave";
  description: string;
  school_id: string;
  created_at: string;
};

export type Task = {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  grade: string;
  due_date: string;
  school_id: string;
  created_at: string;
};

export type TaskSubmission = {
  id: string;
  task_id: string;
  student_id: string;
  content: string;
  file_url: string | null;
  grade_score: number | null;
  created_at: string;
};

export type Notification = {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type ParentStudent = {
  parent_id: string;
  student_id: string;
};
