export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';

export type User = {
  birthDate: string;
  createdAt: string;
  description: string | null;
  email: string;
  firstName: string;
  gender: Gender;
  id: string;
  lastName: string;
  phone: string | null;
};

export type AuthSession = {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
};
