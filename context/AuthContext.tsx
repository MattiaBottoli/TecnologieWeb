"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean
  email: string
  tesserato: boolean
  login: (userEmail: string, isTesserato: boolean) => void;
  logout: () => void
  isTesserato: () => boolean
  setTesseramento: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [tesserato, setTesserato] = useState(false);
  const router=useRouter();

  const login = (userEmail: string, isTesserato: boolean) => {
    setIsLoggedIn(true);
    setEmail(userEmail);
    setTesserato(isTesserato);
  };

  const logout = () => {
    router.push("/")
    setIsLoggedIn(false);
    setEmail("");
    setTesserato(false);
  };

  const isTesserato = () => {
    return tesserato;
  };

  const setTesseramento = (value: boolean) => {
    setTesserato(value);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, email, tesserato, login, logout, isTesserato, setTesseramento }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro un AuthProvider");
  }
  return context;
};
