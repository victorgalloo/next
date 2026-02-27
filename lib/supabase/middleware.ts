import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/registro") ||
    pathname.startsWith("/callback")
  ) {
    // If logged in and visiting auth pages, redirect to home
    if (user && (pathname === "/login" || pathname === "/registro")) {
      const url = request.nextUrl.clone();
      url.pathname = "/inicio";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protected routes - redirect to login if not authenticated
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile) {
    const role = profile.role;

    // Panic button - only students
    if (pathname.startsWith("/boton-panico") && role !== "alumno") {
      const url = request.nextUrl.clone();
      url.pathname = "/inicio";
      return NextResponse.redirect(url);
    }

    // Director panel - only directors
    if (pathname.startsWith("/panel") && role !== "director") {
      const url = request.nextUrl.clone();
      url.pathname = "/inicio";
      return NextResponse.redirect(url);
    }

    // Create reports - only students
    if (pathname === "/reportes/nuevo" && role !== "alumno") {
      const url = request.nextUrl.clone();
      url.pathname = "/reportes";
      return NextResponse.redirect(url);
    }

    // Create tasks - only teachers
    if (pathname === "/tareas/nueva" && role !== "maestro") {
      const url = request.nextUrl.clone();
      url.pathname = "/tareas";
      return NextResponse.redirect(url);
    }

    // Student records - teachers and directors only
    if (
      pathname.startsWith("/expedientes") &&
      role !== "maestro" &&
      role !== "director" &&
      role !== "padre"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/inicio";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
