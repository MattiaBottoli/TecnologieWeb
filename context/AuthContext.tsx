"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface UserData {
  mail: string;
  tesserato: boolean;
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<UserData>(token);
        setUserData(decoded);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Token JWT non valido o scaduto:", err);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserData(null);
      }
      setLoading(false)
    }
    
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<UserData>(token);
    setUserData(decoded);
    setIsLoggedIn(true);
    //setLoading(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    setIsLoggedIn(false);
    setLoading(false)
    router.push("/");
  };

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
