import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, SessionData } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege todas as rotas do painel administrativo, exceto a tela de login
  if (pathname.startsWith("/painel") && !pathname.startsWith("/painel/login")) {
    const cookie = request.cookies.get(sessionOptions.cookieName);

    if (!cookie?.value) {
      const loginUrl = new URL("/painel/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const data = await unsealData<SessionData>(cookie.value, {
        password: sessionOptions.password,
      });

      if (!data?.isAdmin) {
        const loginUrl = new URL("/painel/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/painel/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};

