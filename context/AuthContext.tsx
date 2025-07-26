"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface UserData {
  mail: string;
  tesserato: boolean;
  exp?: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  loading: boolean;
  email: string;
  tesserato: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const startLogoutTimer = (exp: number) => {
    clearLogoutTimer();
    const now = Date.now() / 1000;
    const delay = (exp - now) * 1000;

    if (delay <= 0) {
      logout();
    } else {
      logoutTimerRef.current = setTimeout(() => {
        console.warn("Sessione Scaduta.");
        logout();
      }, delay);
    }
  };

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<UserData>(token);
    setUserData(decoded);
    setIsLoggedIn(true);
    setLoading(false);

    if (decoded.exp) {
      startLogoutTimer(decoded.exp);
    }
  };

  const logout = () => {
    clearLogoutTimer();
    localStorage.removeItem("token");
    setUserData(null);
    setIsLoggedIn(false);
    setLoading(false);
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp < now) {
          logout();
        } else {
          setUserData(decoded);
          setIsLoggedIn(true);
          if (decoded.exp) {
            startLogoutTimer(decoded.exp);
          }
        }
      } catch (err) {
        console.error("Token non valido:", err);
        logout();
      }
    }

    setLoading(false);

    return () => {
      clearLogoutTimer();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userData,
        loading,
        email: userData?.mail || "",
        tesserato: userData?.tesserato || false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider");
  }
  return context;
};
