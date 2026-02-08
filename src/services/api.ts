import { getToken, hasValidToken, removeToken } from "./auth";
import { formatApiErrorResponse } from "../utils/formatApiError";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const LOGIN_PATH = "/login";

function redirectToLogin(): never {
  removeToken();
  window.location.href = LOGIN_PATH;
  throw new Error("Session expired or invalid. Redirecting to login.");
}

export function getApiBase(): string {
  return API_BASE;
}

export function getAuthHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function parseApiError(json: unknown, fallback: string): string {
  const o = json as { message?: string; error?: string; errors?: string[]; conflictingRanges?: unknown };
  return formatApiErrorResponse({
    message: o?.message ?? o?.error ?? fallback,
    errors: o?.errors,
    conflictingRanges: o?.conflictingRanges,
  });
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit & { token?: string | null }
): Promise<T> {
  const { token: tokenOption, headers: initHeaders, ...init } = options;
  const token = tokenOption !== undefined ? tokenOption : getToken();

  if (token != null && token !== "") {
    if (!hasValidToken()) {
      redirectToLogin();
    }
  }

  const authHeaders = getAuthHeaders(token ?? null) as Record<string, string>;
  const mergedHeaders = { ...authHeaders, ...(initHeaders as Record<string, string> | undefined) };
  const res = await fetch(url, {
    ...init,
    headers: mergedHeaders,
  });
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    redirectToLogin();
  }

  if (!res.ok) {
    throw new Error(parseApiError(json, `Request failed (${res.status})`));
  }
  return json as T;
}
