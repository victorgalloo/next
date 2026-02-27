-- ==========================================
-- Trigger: Auto-create profile on user signup
-- ==========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, school_id, grade)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'alumno'),
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario'),
    (new.raw_user_meta_data->>'school_id')::uuid,
    new.raw_user_meta_data->>'grade'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================
-- Trigger: Notify directors on panic alert
-- ==========================================
create or replace function public.notify_directors_on_panic()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  director record;
  student_name text;
begin
  -- Get student name
  select full_name into student_name
  from public.profiles where id = new.student_id;

  -- Notify all directors in the same school
  for director in
    select id from public.profiles
    where role = 'director' and school_id = new.school_id
  loop
    insert into public.notifications (recipient_id, type, title, body, link)
    values (
      director.id,
      'panic_alert',
      '🚨 Alerta de pánico activada',
      'El alumno ' || coalesce(student_name, 'Desconocido') || ' ha activado el botón de pánico.',
      '/boton-panico'
    );
  end loop;

  return new;
end;
$$;

create trigger on_panic_alert_created
  after insert on public.panic_alerts
  for each row execute function public.notify_directors_on_panic();

-- ==========================================
-- Trigger: Notify parents on incident
-- ==========================================
create or replace function public.notify_parents_on_incident()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent record;
  student_name text;
begin
  select full_name into student_name
  from public.profiles where id = new.student_id;

  for parent in
    select parent_id from public.parent_student
    where student_id = new.student_id
  loop
    insert into public.notifications (recipient_id, type, title, body, link)
    values (
      parent.parent_id,
      'incident_registered',
      'Nuevo incidente registrado',
      'Se ha registrado un incidente (' || new.type || ') para ' || coalesce(student_name, 'su hijo/a') || '.',
      '/expedientes/' || new.student_id
    );
  end loop;

  return new;
end;
$$;

create trigger on_incident_created
  after insert on public.incidents
  for each row execute function public.notify_parents_on_incident();

-- ==========================================
-- Trigger: Notify students on new task
-- ==========================================
create or replace function public.notify_students_on_task()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  student record;
begin
  for student in
    select id from public.profiles
    where role = 'alumno'
      and grade = new.grade
      and school_id = new.school_id
  loop
    insert into public.notifications (recipient_id, type, title, body, link)
    values (
      student.id,
      'new_task',
      'Nueva tarea asignada',
      new.title,
      '/tareas/' || new.id
    );
  end loop;

  return new;
end;
$$;

create trigger on_task_created
  after insert on public.tasks
  for each row execute function public.notify_students_on_task();

-- ==========================================
-- Function: Insert notification (for use in app)
-- ==========================================
create or replace function public.insert_notification(
  p_recipient_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_link text default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.notifications (recipient_id, type, title, body, link)
  values (p_recipient_id, p_type, p_title, p_body, p_link);
end;
$$;
