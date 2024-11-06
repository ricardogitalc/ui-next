"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";
import { Alert, AlertDescription } from "../ui/alert";
import { AuthLinks } from "./auth-links";
import { AuthResponse } from "@/lib/api/auth/types";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      confirmEmail: formData.get("confirmEmail") as string,
      whatsapp: formData.get("whatsapp") as string,
    };

    const response: AuthResponse = await authApi.register(data);

    if (response.error) {
      setError(response.error);
    } else if (response.message) {
      setSuccess(response.message);
    }

    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>Registre-se para acessar a plataforma</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              required
              id="firstName"
              name="firstName"
              placeholder="Digite seu nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              required
              id="lastName"
              name="lastName"
              placeholder="Digite seu sobrenome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              required
              type="email"
              id="email"
              name="email"
              placeholder="Digite seu email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmEmail">Confirmar Email</Label>
            <Input
              required
              type="email"
              id="confirmEmail"
              name="confirmEmail"
              placeholder="Confirme seu email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              placeholder="Ex: 11999999999"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => authApi.googleAuth()}
            disabled={loading}
          >
            Continuar com Google
          </Button>
        </CardFooter>
      </form>
      <AuthLinks type="register" />
    </Card>
  );
}
