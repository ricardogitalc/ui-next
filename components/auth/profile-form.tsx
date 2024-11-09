"use client";

import { useState } from "react";
import { User, UpdateUserProfile } from "@/types/user";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormProfileProps {
  user: User;
}

export function ProfileForm({ user }: FormProfileProps) {
  const { refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    // Cria objeto apenas com campos preenchidos
    const data: UpdateUserProfile = {};

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const whatsapp = formData.get("whatsapp") as string;

    if (firstName?.trim()) data.firstName = firstName.trim();
    if (lastName?.trim()) data.lastName = lastName.trim();

    // Só inclui whatsapp se estiver preenchido
    if (whatsapp?.trim()) {
      // Remove todos os caracteres não numéricos
      const whatsappClean = whatsapp.replace(/\D/g, "");
      if (whatsappClean) {
        data.whatsapp = whatsappClean;
      }
    }

    try {
      await api.patch(`/auth/users/${user.id}`, data);
      await refreshAuth();
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message?.[0] ||
        err.message ||
        "Erro ao atualizar perfil";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Atualize suas informações pessoais</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={user.firstName}
              placeholder="Nome"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user.lastName}
              placeholder="Sobrenome"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              defaultValue={user.whatsapp || ""}
              placeholder="WhatsApp (apenas números)"
              pattern="\d*"
              title="Digite apenas números"
              disabled={isLoading}
            />
          </div>
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
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar perfil"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
