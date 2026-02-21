"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  assertAdminSessionClient,
  clearAdminSession,
} from "@/features/admin/auth/client-actions";
import { AdminSessionResponse } from "@/features/admin/auth/types";
import { useAuthTokenSync } from "@/hooks/useAuthTokenSync";

interface AuthContextType {
  session: AdminSessionResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync token to cookies for server-side access
  useAuthTokenSync();

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const data = await assertAdminSessionClient();
      setSession(data);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAdminSession();
    setSession(null);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: !!session,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
