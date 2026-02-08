import { formatApiError } from "../utils/formatApiError";

const TOKEN_KEY = "auth_token";
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  return token;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
export function hasValidToken(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "{}"));
    const exp = payload.exp as number | undefined;
    if (exp && Date.now() >= exp * 1000) return false;
    return true;
  } catch {
    return true;
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: { id: string; email: string };
}

export interface RegisterResponse {
  token?: string;
  id?: string;
  username?: string;
  email?: string;
}

export interface RegisterCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatApiError(data.message ?? data.error ?? "Error in login"));
  }
  if (!data.token) {
    throw new Error("Sign-in failed. Please try again.");
  }
  return data as LoginResponse;
}

const VERIFY_TIMEOUT_MS = 5000;
export async function register(
  dataUser: RegisterCredentials,
): Promise<RegisterResponse> {
  const body = {
    name: dataUser.name,
    username: dataUser.username,
    email: dataUser.email,
    password: dataUser.password,
  };
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatApiError(data.message ?? data.error ?? "Registration failed"));
  }
  return data as RegisterResponse;
}

export async function validateTokenWithBackend(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.status === 401) return false;
    return true;
  } catch {
    return hasValidToken();
  }
}
