import { createContext } from "react";
import type { LoginCredentials, RegisterCredentials } from "../services/auth";

export interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  register: (userData: RegisterCredentials) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
