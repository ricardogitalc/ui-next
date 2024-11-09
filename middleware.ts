import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que exigem autenticação
const protectedRoutes = ["/dashboard"];

// Rotas que só podem ser acessadas por usuários NÃO autenticados
const authRoutes = ["/login", "/register", "/verify-login"];

// Rotas públicas - acessíveis para todos
const publicRoutes = [
  "/",
  "/contact",
  "/terms",
  "/privacy",
  "/verify-register/[token]", // Adicione esta linha
];

export function middleware(request: NextRequest) {
  const hasAuthCookie = request.cookies.has("auth.accessToken");
  const { pathname } = request.nextUrl;

  // Verifica se é a rota raiz ou uma rota pública
  if (pathname === "/" || publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Redireciona usuários logados para home se tentarem acessar rotas de auth
  if (hasAuthCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redireciona usuários não logados para login se tentarem acessar rotas protegidas
  if (!hasAuthCookie && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedRoutes, ...authRoutes, ...publicRoutes],
};
