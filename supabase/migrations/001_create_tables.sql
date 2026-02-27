-- Schools
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz default now()
);

-- Profiles (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('alumno', 'padre', 'maestro', 'director')),
  full_name text not null,
  school_id uuid references public.schools(id),
  grade text,
  created_at timestamptz default now()
);

-- Parent-student relationship
create table public.parent_student (
  parent_id uuid references public.profiles(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  primary key (parent_id, student_id)
);

-- Reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  is_anonymous boolean default false,
  category text not null check (category in ('bullying', 'verbal', 'fisico', 'sexual', 'ciberacoso', 'robo', 'otro')),
  title text not null,
  description text not null,
  location text,
  status text not null default 'pendiente' check (status in ('pendiente', 'en_revision', 'resuelto', 'descartado')),
  involved_student_ids uuid[],
  school_id uuid references public.schools(id),
  created_at timestamptz default now()
);

-- Panic alerts
create table public.panic_alerts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  latitude double precision,
  longitude double precision,
  status text not null default 'activa' check (status in ('activa', 'atendida', 'falsa_alarma')),
  attended_by uuid references public.profiles(id),
  school_id uuid references public.schools(id),
  created_at timestamptz default now()
);

-- Incidents (student records)
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  type text not null check (type in ('conducta', 'academico', 'asistencia', 'positivo')),
  severity text not null check (severity in ('leve', 'moderado', 'grave')),
  description text not null,
  school_id uuid references public.schools(id),
  created_at timestamptz default now()
);

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  grade text not null,
  due_date date not null,
  school_id uuid references public.schools(id),
  created_at timestamptz default now()
);

-- Task submissions
create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  file_url text,
  grade_score numeric,
  created_at timestamptz default now(),
  unique (task_id, student_id)
);

-- Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index idx_profiles_school on public.profiles(school_id);
create index idx_profiles_role on public.profiles(role);
create index idx_reports_school on public.reports(school_id);
create index idx_reports_status on public.reports(status);
create index idx_panic_alerts_school on public.panic_alerts(school_id);
create index idx_panic_alerts_status on public.panic_alerts(status);
create index idx_incidents_student on public.incidents(student_id);
create index idx_tasks_grade on public.tasks(grade);
create index idx_tasks_school on public.tasks(school_id);
create index idx_notifications_recipient on public.notifications(recipient_id);
create index idx_notifications_unread on public.notifications(recipient_id) where is_read = false;

-- Enable Realtime for notifications
alter publication supabase_realtime add table public.notifications;

-- Insert a test school
insert into public.schools (id, name, address)
values ('00000000-0000-0000-0000-000000000001', 'Escuela Primaria Demo', 'Av. Ejemplo 123, Ciudad de México');
