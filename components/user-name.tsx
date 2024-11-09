"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

// Mudando para default export
export default function UserName() {
  const { isAuthenticated, user } = useAuth();

  return (
    <DropdownMenuItem className="flex justify-center">
      <span className="font-bold">
        {isAuthenticated && user ? `Olá, ${user.firstName}` : "Olá, visitante"}
      </span>
    </DropdownMenuItem>
  );
}
