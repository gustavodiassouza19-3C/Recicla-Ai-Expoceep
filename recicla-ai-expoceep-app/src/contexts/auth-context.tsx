"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  nome: string;
  usuario_id: number | null;
  tipo: string;
  household_size: number;
  cpf?: string;
  sexo?: string;
  idade?: number;
}

interface ProfileResponse {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  sexo?: string;
  idade?: number;
  tipo?: string;
  household_size?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; tipo?: string }>;
  register: (
    nome: string,
    email: string,
    password: string,
    householdSize: number,
    sexo?: string,
    idade?: number
  ) => Promise<{ error?: string; emailConfirmationRequired?: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchBackendProfile(jwt: string): Promise<ProfileResponse | null> {
  if (!API_URL) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as ProfileResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchUsuarioData(email: string): Promise<{
  usuario_id: number | null;
  household_size: number;
}> {
  let usuarioId: number | null = null;
  let householdSize = 1;

  try {
    const { data: uid, error } = await supabase.rpc("get_current_usuario_id");
    if (!error && uid) usuarioId = uid;
  } catch {}

  if (!usuarioId) {
    try {
      const { data: row } = await supabase
        .from("usuarios")
        .select("id, household_size")
        .eq("email", email)
        .maybeSingle();
      if (row) {
        usuarioId = row.id;
        householdSize = row.household_size || 1;
      }
    } catch {}
  }

  return { usuario_id: usuarioId, household_size: householdSize };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const restoredRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const stored = localStorage.getItem("supabase_token");
    const storedUser = localStorage.getItem("supabase_user");

    const restore = async () => {
      if (!stored || !storedUser) {
        if (active) {
          restoredRef.current = true;
          setLoading(false);
        }
        return;
      }

      try {
        const parsed = JSON.parse(storedUser) as User;
        const { data } = await supabase.auth.getSession();
        const restoredToken = data.session?.access_token || stored;
        const profile = await fetchBackendProfile(restoredToken);
        const fallback = await fetchUsuarioData(parsed.email);
        if (!active) return;
        setToken(restoredToken);
        setUser({
          ...parsed,
          usuario_id: profile?.id ?? fallback.usuario_id,
          tipo: profile?.tipo || parsed.tipo || "cliente",
          household_size: profile?.household_size || fallback.household_size,
        });
        localStorage.setItem("supabase_token", restoredToken);
      } catch {
        localStorage.removeItem("supabase_token");
        localStorage.removeItem("supabase_user");
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          restoredRef.current = true;
          setLoading(false);
        }
      }
    };

    void restore();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextToken = session?.access_token || null;
      if (nextToken) localStorage.setItem("supabase_token", nextToken);
      else localStorage.removeItem("supabase_token");
      if (!active || !restoredRef.current) return;
      setToken(nextToken);
      setLoading(false);
      if (!session) setUser(null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      return { error: error?.message || "Sessao nao encontrada" };
    }

    const jwt = data.session.access_token;
    const profile = await fetchBackendProfile(jwt);
    const fallback = await fetchUsuarioData(data.user.email || email);
    const userData: User = {
      id: data.user.id,
      email: data.user.email || email,
      nome: profile?.nome || data.user.user_metadata?.nome || email.split("@")[0],
      usuario_id: profile?.id ?? fallback.usuario_id,
      tipo: profile?.tipo || "cliente",
      household_size: profile?.household_size || fallback.household_size,
      cpf: profile?.cpf || data.user.user_metadata?.cpf,
      sexo: profile?.sexo || data.user.user_metadata?.sexo,
      idade: profile?.idade || data.user.user_metadata?.idade,
    };

    localStorage.setItem("supabase_token", jwt);
    localStorage.setItem("supabase_user", JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return { tipo: userData.tipo };
  };

  const register = async (
    nome: string,
    email: string,
    password: string,
    householdSize: number,
    sexo?: string,
    idade?: number
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, sexo, idade, household_size: householdSize } },
    });
    if (error) return { error: error.message };
    if (!data.user) {
      return { error: "Não foi possível criar a conta." };
    }
    if (!data.session) {
      return { emailConfirmationRequired: true };
    }

    const jwt = data.session.access_token;
    const profile = await fetchBackendProfile(jwt);
    const fallback = await fetchUsuarioData(data.user.email || email);
    const userData: User = {
      id: data.user.id,
      email: data.user.email || email,
      nome: profile?.nome || nome,
      usuario_id: profile?.id ?? fallback.usuario_id,
      tipo: profile?.tipo || "cliente",
      household_size: profile?.household_size || fallback.household_size || householdSize,
      cpf: profile?.cpf,
      sexo: profile?.sexo || sexo,
      idade: profile?.idade || idade,
    };

    localStorage.setItem("supabase_token", jwt);
    localStorage.setItem("supabase_user", JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return {};
  };

  const logout = () => {
    void supabase.auth.signOut();
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
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}
