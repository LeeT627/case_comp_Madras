export interface GpaiUser {
  id: string;
  email: string;
  isGuest: boolean;
  creditBalance: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isSignup?: boolean;
  signupEventId?: string;
}

export interface LoginResponse {
  user: GpaiUser;
}

export interface ErrorResponse {
  error: string;
}

