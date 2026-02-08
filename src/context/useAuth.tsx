import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthContext } from "./authContext";
import {
  getToken,
  setToken as saveToken,
  removeToken,
  hasValidToken,
  login as apiLogin,
  validateTokenWithBackend,
  type LoginCredentials,
  register as apiRegister,
  type RegisterCredentials,
} from "../services/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const tokenFromStorage = getToken();
    if (!tokenFromStorage || !hasValidToken()) {
      removeToken();
      setTokenState(null);
      return false;
    }
    const valid = await validateTokenWithBackend();
    if (!valid) {
      removeToken();
      setTokenState(null);
      return false;
    }
    setTokenState(getToken());
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tokenFromStorage = getToken();
      if (!tokenFromStorage || !hasValidToken()) {
        removeToken();
        if (!cancelled) setTokenState(null);
      } else {
        const valid = await validateTokenWithBackend();
        if (!cancelled) {
          if (!valid) {
            removeToken();
            setTokenState(null);
          } else {
            setTokenState(getToken());
          }
        }
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { token: newToken } = await apiLogin(credentials);
    saveToken(newToken);
    setTokenState(newToken);
  }, []);
  const register = useCallback(async (userData: RegisterCredentials) => {
    const res = await apiRegister(userData);
    if (res?.token) {
      saveToken(res.token);
      setTokenState(res.token);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
  }, []);

  const value = {
    token,
    isAuthenticated: !!token && hasValidToken(),
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
