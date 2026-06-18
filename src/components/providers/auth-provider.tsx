"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SerializedUser } from "@/models/user.model";

interface AuthContextType {
  user: SerializedUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setSession: (token: string, user: SerializedUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SerializedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setUser(null);
      setLoading(false);

      if (!isPublicRoute(pathname)) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        if (pathname === "/login" || pathname === "/register") {
          router.replace("/dashboard");
        }
      } else {
        const isUnverified = response.status === 403;
        localStorage.removeItem("token");
        setUser(null);

        if (!isPublicRoute(pathname)) {
          const redirect = isUnverified
            ? `/login?error=verify-email&redirect=${encodeURIComponent(pathname)}`
            : `/login?redirect=${encodeURIComponent(pathname)}`;
          router.replace(redirect);
        }
      }
    } catch (error) {
      console.error("[AuthProvider] Failed to fetch user:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  const setSession = useCallback((token: string, nextUser: SerializedUser) => {
    localStorage.setItem("token", token);
    setUser(nextUser);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Clear local session even if API call fails.
    }
    localStorage.removeItem("token");
    setUser(null);
    router.replace("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
