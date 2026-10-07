"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiFetch, invalidateApiCache } from "@/lib/api";
import { getSitePath } from "@/lib/site-url";

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
  requestResetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Traduz os erros do Supabase Auth para PT-BR. A tela e em portugues, e exibir
 * "email rate limit exceeded"cru em um formulario parece defeito. A busca e por
 * substring do texto original, entao continua valendo se o Supabase ajustar a
 * pontuacao ou o envelope da mensagem.
 */
function friendlyAuthError(message: string, context: "reset" | "update"): string {
  const m = message.toLowerCase();

  if (m.includes("rate limit") || m.includes("too many") || m.includes("429")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (m.includes("email not confirmed") || m.includes("not confirmed")) {
    return "Este email ainda não foi confirmado. Confirme o email primeiro.";
  }
  if (m.includes("should exist") || m.includes("not found")) {
    return context === "reset"
      ? "Não encontramos uma conta com este email."
      : "Não foi possível atualizar a senha. Peça um novo link de recuperação.";
  }
  if (m.includes("new password should be different")) {
    return "A nova senha precisa ser diferente da senha atual.";
  }
  if (m.includes("password") && m.includes("at least")) {
    return "A senha é muito curta.";
  }
  if (m.includes("session") || m.includes("token") || m.includes("expired")) {
    return context === "reset"
      ? "O link de recuperação expirou. Peça um novo."
      : "Sua sessão expirou. Peça um novo link de recuperação.";
  }
  if (m.includes("fetch") || m.includes("network")) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  return context === "reset"
    ? "Não foi possível enviar o email de recuperação. Tente novamente."
    : "Não foi possível atualizar a senha. Tente novamente.";
}

async function fetchBackendProfile(jwt: string): Promise<ProfileResponse | null> {
  if (!API_URL) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // apiFetch compartilha o cache de GET com o points-context: o saldo pedido
    // logo em seguida sai da memoria em vez de repetir a chamada.
    return await apiFetch<ProfileResponse>("/api/users/me", {
      headers: { Authorization: `Bearer ${jwt}` },
      signal: controller.signal,
    });
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

  if (usuarioId) {
    // O caminho do RPC resolvia o id mas nunca lia o household_size, deixando
    // o padrao 1 e fazendo o dashboard e o perfil reiniciarem errados.
    try {
      const { data: row } = await supabase
        .from("usuarios")
        .select("household_size")
        .eq("id", usuarioId)
        .maybeSingle();
      if (row?.household_size) householdSize = row.household_size;
    } catch {}
  } else {
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
        // O backend ja devolve id e household_size. O fallback ia direto ao
        // Supabase com mais 2 chamadas e so compensava quando o backend nao
        // respondia, entao agora so roda nesse caso.
        const fallback = profile ? null : await fetchUsuarioData(parsed.email);
        if (!active) return;
        setToken(restoredToken);
        setUser({
          ...parsed,
          usuario_id: profile?.id ?? fallback?.usuario_id ?? null,
          tipo: profile?.tipo || parsed.tipo || "cliente",
          household_size:
            profile?.household_size || fallback?.household_size || parsed.household_size || 1,
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
    if (!user) return;

    // Backend primeiro (service key, leitura confiavel); Supabase direto
    // apenas como fallback quando o backend nao responde.
    const fresh = token ? await fetchBackendProfile(token) : null;

    if (fresh) {
      const updated: User = {
        ...user,
        usuario_id: fresh.id ?? user.usuario_id,
        nome: fresh.nome || user.nome,
        tipo: fresh.tipo || user.tipo,
        household_size: fresh.household_size || user.household_size,
        cpf: fresh.cpf ?? user.cpf,
        sexo: fresh.sexo ?? user.sexo,
        idade: fresh.idade ?? user.idade,
      };
      setUser(updated);
      localStorage.setItem("supabase_user", JSON.stringify(updated));
      return;
    }

    if (!user.usuario_id) return;
    try {
      const { data: row } = await supabase
        .from("usuarios")
        .select("household_size")
        .eq("id", user.usuario_id)
        .maybeSingle();
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
    const fallback = profile ? null : await fetchUsuarioData(data.user.email || email);
    const userData: User = {
      id: data.user.id,
      email: data.user.email || email,
      nome: profile?.nome || data.user.user_metadata?.nome || email.split("@")[0],
      usuario_id: profile?.id ?? fallback?.usuario_id ?? null,
      tipo: profile?.tipo || "cliente",
      household_size: profile?.household_size || fallback?.household_size || 1,
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
      options: {
        data: { nome, sexo, idade, household_size: householdSize },
        // Sem isto o Supabase manda o link de confirmacao para a Site URL
        // configurada no painel, que pode nao ser o dominio deste deploy.
        // /confirm-email e a tela especial de sucesso com o atalho pro login.
        emailRedirectTo: getSitePath("/confirm-email"),
      },
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

  /**
   * Envia o email de recuperacao do Supabase Auth. O link cai em /reset-password
   * e o cliente de browser detecta o token da URL sozinho (detectSessionInUrl),
   * criando a sessao de recovery que habilita o updateUser.
   *
   * A URL vem de getSitePath, e nao de window.location: testando local o
   * usuario receberia "http://localhost:3000/reset-password", que nao abre no
   * celular dele. O destino tambem precisa estar na allowlist de Redirect URLs
   * configurada no projeto do Supabase.
   *
   * O Supabase responde em ingles e com texto interno ("email rate limit
   * exceeded", "User should exist"). A tela e PT-BR, e um erro cru ali parece
   * defeito, entao traduzimos os casos conhecidos e caimos em uma mensagem
   * generica, sem vazar detalhe de backend.
   */
  const requestResetPassword = async (email: string) => {
    const redirectTo = getSitePath("/reset-password");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { error: friendlyAuthError(error.message, "reset") };
    return {};
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: friendlyAuthError(error.message, "update") };
    return {};
  };

  const logout = () => {
    void supabase.auth.signOut();
    invalidateApiCache();
    localStorage.removeItem("supabase_token");
    localStorage.removeItem("supabase_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        requestResetPassword,
        updatePassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}
