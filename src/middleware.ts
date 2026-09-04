import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSubdomain(hostname: string): string | null {
  const base = "myshopa.com.ng";
  const stripped = hostname.replace(":3000", "").replace(":80", "").replace(":443", "");
  // Apex and www both serve the app root — www is never a store.
  if (stripped === base || stripped === `www.${base}`) return null;
  if (stripped.endsWith("." + base)) {
    const sub = stripped.replace("." + base, "");
    if (sub && !sub.includes(".")) return sub;
  }
  return null;
}

export async function middleware(request: NextRequest) {
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

  const hostname = request.headers.get("host") || "";

  // NOTE: www is served as the apex deliberately — never redirect it.
  // An edge-level redirect (apex->www) combined with an app-level redirect
  // (www->apex) loops forever (ERR_TOO_MANY_REDIRECTS). Serving both
  // converges no matter which side redirects.
  const subdomain = getSubdomain(hostname);

  if (subdomain) {
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  const pathname = request.nextUrl.pathname;

  // Self-healing OAuth landing: if Supabase's redirect allowlist doesn't
  // include our /auth/callback URL, it falls back to the Site URL and drops
  // the auth ?code= on "/". Forward it to the callback instead of stranding
  // the user on the homepage.
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.has("next")) url.searchParams.set("next", "/dashboard");
    return NextResponse.redirect(url);
  }

  // Public pages skip the Supabase auth round-trip entirely (faster TTFB).
  // Only /dashboard and /onboarding require a session.
  const isProtected = pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/onboarding";

  if (!isProtected) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
