"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  nome: string;
  cpf?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (nome: string, email: string, password: string, cpf?: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("supabase_token");
    const storedUser = localStorage.getItem("supabase_user");

    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    const jwt = data.session.access_token;
    const userData: User = {
      id: data.user.id,
      email: data.user.email || "",
      nome: data.user.user_metadata?.nome || email.split("@")[0],
      cpf: data.user.user_metadata?.cpf,
    };

    localStorage.setItem("supabase_token", jwt);
    localStorage.setItem("supabase_user", JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);

    return {};
  };

  const register = async (nome: string, email: string, password: string, cpf?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, cpf },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session && data.user) {
      const jwt = data.session.access_token;
      const userData: User = {
        id: data.user.id,
        email: data.user.email || "",
        nome,
        cpf,
      };

      localStorage.setItem("supabase_token", jwt);
      localStorage.setItem("supabase_user", JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
    }

    return {};
  };

  const logout = () => {
    supabase.auth.signOut();
    localStorage.removeItem("supabase_token");
    localStorage.removeItem("supabase_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
