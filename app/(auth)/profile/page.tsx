"use client";

import { api } from "@/lib/api";
import { UpdateUserProfile } from "@/types/user";
import { useAuth } from "@/contexts/auth-context";
import { ProfileForm } from "@/components/auth/profile-form";

export default function Profile() {
  const { user, refreshAuth } = useAuth();

  const handleUpdateProfile = async (data: UpdateUserProfile) => {
    const userId = user?.id;
    if (!userId) throw new Error("ID do usuário não encontrado");

    await api.patch(`/auth/users/${userId}`, data);
    await refreshAuth();
  };

  if (!user) return <div>Usuário não encontrado</div>;

  return (
    <div className="max-w-[600px] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="mb-6">
          <h2 className="text-gray-500 mb-2">Email</h2>
          <p>{user.email}</p>
        </div>

        <ProfileForm user={user} onSubmit={handleUpdateProfile} />
      </div>
    </div>
  );
}
