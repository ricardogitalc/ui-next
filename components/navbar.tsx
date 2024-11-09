"use client";

import { User, Download, Star, CreditCard, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { useAuth } from "@/contexts/auth-context";
import UserGreeting from "./user-name";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Só mostrar o dropdown se estiver autenticado
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center">
        <Link href="/">
          <span className="text-xl font-bold">Logo</span>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <ModeToggle />
        {!isAuthenticated ? (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <UserGreeting />
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Minha conta</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/downloads">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Downloads</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/favoritos">
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4" />
                  <span>Favoritos</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/assinatura">
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Assinatura</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/seguindo">
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Seguindo</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
