export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp?: string | null;
  profilePicture?: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  whatsapp?: string;
  address?: string;
  avatar?: string;
}
