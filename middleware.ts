import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Definição das rotas
const protectedRoutes = [
  "/dashboard",
  "/profile",
  // ... outras rotas protegidas
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  // ... outras rotas de autenticação
];

const publicRoutes = ["/", "/terms", "/privacy", "/verify-register/[token]"];

// Combinar todas as rotas em um único array
const allRoutes = [...protectedRoutes, ...authRoutes, ...publicRoutes].filter(
  Boolean
); // Remove possíveis valores undefined/null

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");
  const isAuthPage = request.nextUrl.pathname === "/login";

  // Se não há tokens e está tentando acessar uma rota protegida
  if (!accessToken && !refreshToken && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se há tokens e está tentando acessar página de auth
  if ((accessToken || refreshToken) && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configuração corrigida do matcher
export const config = {
  matcher: [
    "/dashboard",
    "/profile",
    "/login",
    "/register",
    "/forgot-password",
    "/terms",
    "/privacy",
    "/verify-register/:token*", // Corrigido para usar o formato correto de rota dinâmica
  ],
};
