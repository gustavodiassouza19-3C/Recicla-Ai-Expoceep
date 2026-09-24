"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  nome: string;
  usuario_id: number | null;
  household_size: number;
  cpf?: string;
  sexo?: string;
  idade?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    nome: string,
    email: string,
    password: string,
    householdSize: number,
    cpf?: string,
    sexo?: string,
    idade?: number
  ) => Promise<{ error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

  async function fetchUsuarioData(authUserId: string): Promise<{ usuario_id: number | null; household_size: number }> {
    let usuarioId: number | null = null;
    let householdSize = 1;

    try {
      const { data: uid } = await supabase.rpc("get_current_usuario_id");
      if (uid) usuarioId = uid;
    } catch {}

    if (usuarioId) {
      try {
        const { data: row } = await supabase
          .from("usuarios")
          .select("household_size")
          .eq("id", usuarioId)
          .single();
        if (row?.household_size) householdSize = row.household_size;
      } catch {}
    }

    return { usuario_id: usuarioId, household_size: householdSize };
  }

  const refreshUser = async () => {
    if (!user?.usuario_id) return;
    try {
      const { data: row } = await supabase
        .from("usuarios")
        .select("household_size")
        .eq("id", user.usuario_id)
        .single();
      if (row?.household_size !== undefined) {
        const updated = { ...user, household_size: row.household_size };
        setUser(updated);
        localStorage.setItem("supabase_user", JSON.stringify(updated));
      }
    } catch {}
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    const jwt = data.session.access_token;
    const { usuario_id, household_size } = await fetchUsuarioData(data.user.id);

    const userData: User = {
      id: data.user.id,
      email: data.user.email || "",
      nome: data.user.user_metadata?.nome || email.split("@")[0],
      usuario_id,
      household_size,
      cpf: data.user.user_metadata?.cpf,
      sexo: data.user.user_metadata?.sexo,
      idade: data.user.user_metadata?.idade,
    };

    localStorage.setItem("supabase_token", jwt);
    localStorage.setItem("supabase_user", JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);

    return {};
  };

  const register = async (
    nome: string,
    email: string,
    password: string,
    householdSize: number,
    cpf?: string,
    sexo?: string,
    idade?: number
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, cpf, sexo, idade },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session && data.user) {
      const jwt = data.session.access_token;
      const { usuario_id, household_size } = await fetchUsuarioData(data.user.id);

      // Atualiza household_size se não veio do fetch (usuário novo)
      if (usuario_id && household_size === 1 && householdSize > 1) {
        await supabase
          .from("usuarios")
          .update({ household_size: householdSize })
          .eq("id", usuario_id);
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email || "",
        nome,
        usuario_id,
        household_size: householdSize,
        cpf,
        sexo,
        idade,
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
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
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
