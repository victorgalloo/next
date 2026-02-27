-- Enable RLS on all tables
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.parent_student enable row level security;
alter table public.reports enable row level security;
alter table public.panic_alerts enable row level security;
alter table public.incidents enable row level security;
alter table public.tasks enable row level security;
alter table public.task_submissions enable row level security;
alter table public.notifications enable row level security;

-- Helper functions
create or replace function public.get_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.get_user_school_id()
returns uuid
language sql
security definer
stable
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

create or replace function public.get_user_grade()
returns text
language sql
security definer
stable
as $$
  select grade from public.profiles where id = auth.uid()
$$;

-- ==================== SCHOOLS ====================
create policy "Everyone can read schools"
  on public.schools for select
  to authenticated
  using (true);

-- ==================== PROFILES ====================
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Staff can read profiles in their school"
  on public.profiles for select
  to authenticated
  using (
    school_id = public.get_user_school_id()
    and public.get_user_role() in ('maestro', 'director')
  );

create policy "Parents can read their children profiles"
  on public.profiles for select
  to authenticated
  using (
    id in (
      select student_id from public.parent_student where parent_id = auth.uid()
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ==================== PARENT_STUDENT ====================
create policy "Parents can see their links"
  on public.parent_student for select
  to authenticated
  using (parent_id = auth.uid());

create policy "Directors can manage parent-student links"
  on public.parent_student for all
  to authenticated
  using (public.get_user_role() = 'director');

-- ==================== REPORTS ====================
create policy "Students can create reports"
  on public.reports for insert
  to authenticated
  with check (
    public.get_user_role() = 'alumno'
  );

create policy "Students see own reports"
  on public.reports for select
  to authenticated
  using (
    reporter_id = auth.uid()
    and public.get_user_role() = 'alumno'
  );

create policy "Staff see school reports"
  on public.reports for select
  to authenticated
  using (
    school_id = public.get_user_school_id()
    and public.get_user_role() in ('maestro', 'director')
  );

create policy "Staff can update report status"
  on public.reports for update
  to authenticated
  using (
    school_id = public.get_user_school_id()
    and public.get_user_role() in ('maestro', 'director')
  )
  with check (
    school_id = public.get_user_school_id()
    and public.get_user_role() in ('maestro', 'director')
  );

-- ==================== PANIC ALERTS ====================
create policy "Students can create panic alerts"
  on public.panic_alerts for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and public.get_user_role() = 'alumno'
  );

create policy "Students see own panic alerts"
  on public.panic_alerts for select
  to authenticated
  using (
    student_id = auth.uid()
  );

create policy "Staff see school panic alerts"
  on public.panic_alerts for select
  to authenticated
  using (
    school_id = public.get_user_school_id()
    and public.get_user_role() in ('maestro', 'director')
  );

create policy "Directors can update panic alert status"
  on public.panic_alerts for update
  to authenticated
  using (
    school_id = public.get_user_school_id()
    and public.get_user_role() = 'director'
  );

-- ==================== INCIDENTS ====================
create policy "Staff can create incidents"
  on public.incidents for insert
  to authenticated
  with check (
    public.get_user_role() in ('maestro', 'director')
  );

create policy "Students see own incidents"
  on public.incidents for select
  to authenticated
  using (
    student_id = auth.uid()
  );

create policy "Parents see their children incidents"
  on public.incidents for select
  to authenticated
  using (
    student_id in (
      select student_id from public.parent_student where parent_id = auth.uid()
    )
  );

create policy "Staff see school incidents"
  on public.incidents for select
  to authenticated
  using (
    school_id = public.get_user_school_id()
    and public.get_user_role() in ('maestro', 'director')
  );

-- ==================== TASKS ====================
create policy "Teachers can create tasks"
  on public.tasks for insert
  to authenticated
  with check (
    teacher_id = auth.uid()
    and public.get_user_role() = 'maestro'
  );

create policy "Teachers can update own tasks"
  on public.tasks for update
  to authenticated
  using (teacher_id = auth.uid());

create policy "Students see tasks for their grade"
  on public.tasks for select
  to authenticated
  using (
    grade = public.get_user_grade()
    and school_id = public.get_user_school_id()
    and public.get_user_role() = 'alumno'
  );

create policy "Parents see tasks for children grade"
  on public.tasks for select
  to authenticated
  using (
    public.get_user_role() = 'padre'
    and grade in (
      select p.grade from public.profiles p
      join public.parent_student ps on ps.student_id = p.id
      where ps.parent_id = auth.uid()
    )
    and school_id = public.get_user_school_id()
  );

create policy "Staff see school tasks"
  on public.tasks for select
  to authenticated
  using (
    school_id = public.get_user_school_id()
    and public.get_user_role() in ('maestro', 'director')
  );

-- ==================== TASK SUBMISSIONS ====================
create policy "Students can submit tasks"
  on public.task_submissions for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and public.get_user_role() = 'alumno'
  );

create policy "Students see own submissions"
  on public.task_submissions for select
  to authenticated
  using (student_id = auth.uid());

create policy "Teachers see submissions for their tasks"
  on public.task_submissions for select
  to authenticated
  using (
    task_id in (select id from public.tasks where teacher_id = auth.uid())
  );

create policy "Teachers can grade submissions"
  on public.task_submissions for update
  to authenticated
  using (
    task_id in (select id from public.tasks where teacher_id = auth.uid())
  );

create policy "Directors see all school submissions"
  on public.task_submissions for select
  to authenticated
  using (
    public.get_user_role() = 'director'
    and task_id in (
      select id from public.tasks where school_id = public.get_user_school_id()
    )
  );

-- ==================== NOTIFICATIONS ====================
create policy "Users see own notifications"
  on public.notifications for select
  to authenticated
  using (recipient_id = auth.uid());

create policy "Users can mark own notifications as read"
  on public.notifications for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());
