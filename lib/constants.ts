export const ROLES = {
  ALUMNO: "alumno",
  PADRE: "padre",
  MAESTRO: "maestro",
  DIRECTOR: "director",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  alumno: "Alumno",
  padre: "Padre/Madre",
  maestro: "Maestro",
  director: "Director",
};

export const REPORT_CATEGORIES = {
  BULLYING: "bullying",
  VERBAL: "verbal",
  FISICO: "fisico",
  SEXUAL: "sexual",
  CIBERACOSO: "ciberacoso",
  ROBO: "robo",
  OTRO: "otro",
} as const;

export type ReportCategory =
  (typeof REPORT_CATEGORIES)[keyof typeof REPORT_CATEGORIES];

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  bullying: "Bullying",
  verbal: "Violencia verbal",
  fisico: "Violencia física",
  sexual: "Violencia sexual",
  ciberacoso: "Ciberacoso",
  robo: "Robo",
  otro: "Otro",
};

export const REPORT_STATUSES = {
  PENDIENTE: "pendiente",
  EN_REVISION: "en_revision",
  RESUELTO: "resuelto",
  DESCARTADO: "descartado",
} as const;

export type ReportStatus =
  (typeof REPORT_STATUSES)[keyof typeof REPORT_STATUSES];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  resuelto: "Resuelto",
  descartado: "Descartado",
};

export const PANIC_STATUSES = {
  ACTIVA: "activa",
  ATENDIDA: "atendida",
  FALSA_ALARMA: "falsa_alarma",
} as const;

export type PanicStatus =
  (typeof PANIC_STATUSES)[keyof typeof PANIC_STATUSES];

export const PANIC_STATUS_LABELS: Record<PanicStatus, string> = {
  activa: "Activa",
  atendida: "Atendida",
  falsa_alarma: "Falsa alarma",
};

export const INCIDENT_TYPES = {
  CONDUCTA: "conducta",
  ACADEMICO: "academico",
  ASISTENCIA: "asistencia",
  POSITIVO: "positivo",
} as const;

export type IncidentType =
  (typeof INCIDENT_TYPES)[keyof typeof INCIDENT_TYPES];

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  conducta: "Conducta",
  academico: "Académico",
  asistencia: "Asistencia",
  positivo: "Positivo",
};

export const SEVERITY_LEVELS = {
  LEVE: "leve",
  MODERADO: "moderado",
  GRAVE: "grave",
} as const;

export type Severity =
  (typeof SEVERITY_LEVELS)[keyof typeof SEVERITY_LEVELS];

export const SEVERITY_LABELS: Record<Severity, string> = {
  leve: "Leve",
  moderado: "Moderado",
  grave: "Grave",
};

export const NOTIFICATION_TYPES = {
  PANIC_ALERT: "panic_alert",
  NEW_REPORT: "new_report",
  INCIDENT_REGISTERED: "incident_registered",
  NEW_TASK: "new_task",
  REPORT_STATUS_CHANGED: "report_status_changed",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
