"use client";

import { useState } from "react";
import { User, UpdateUserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormProfileProps {
  user: User;
  onSubmit: (data: UpdateUserProfile) => Promise<void>;
}

export function ProfileForm({ user, onSubmit }: FormProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
      await onSubmit(data);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="firstName"
        defaultValue={user.firstName}
        placeholder="Nome"
        required
      />
      <Input
        name="lastName"
        defaultValue={user.lastName}
        placeholder="Sobrenome"
        required
      />
      <Input
        name="whatsapp"
        defaultValue={user.whatsapp || ""}
        placeholder="WhatsApp (apenas números)"
        pattern="\d*"
        title="Digite apenas números"
      />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Atualizando..." : "Atualizar perfil"}
      </Button>
    </form>
  );
}
