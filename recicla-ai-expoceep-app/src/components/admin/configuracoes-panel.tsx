"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchSiteConfig, updateSiteConfig } from "./api";

const LINK_INVALIDO =
  "Informe um link que comece com http:// ou https:// (ou deixe vazio para esconder).";

/**
 * Aba autossuficiente, igual a RecompensasPanel: carrega e grava sozinha,
 * porque nada fora dela consome site_config.
 *
 * Nao existe switch de publicacao: o criterio e o campo em si -- vazio, o
 * banner do dashboard some.
 */
export function ConfiguracoesPanel({ token }: { token: string | null }) {
  const [link, setLink] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const config = await fetchSiteConfig(token);
      setLink(config.link_votacao);
    } catch {
      setErro("");
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    (async () => {
      await recarregar();
    })();
  }, [recarregar]);

  const alterar = (valor: string) => {
    setLink(valor);
    setErro("");
    setSalvo(false);
  };

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro("");
    setSalvo(false);

    const limpo = link.trim();
    if (limpo && !/^https?:\/\//i.test(limpo)) {
      setErro(LINK_INVALIDO);
      return;
    }

    setSalvando(true);
    try {
      const salvo = await updateSiteConfig(limpo, token);
      setLink(salvo.link_votacao);
      setSalvo(true);
      await recarregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar a configuracao");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6" id="form-configuracoes">
        <h2 className="text-lg font-semibold text-foreground">Link da votacao</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole aqui o formulario de votacao do melhor projeto. O link vira um
          banner no topo do dashboard do usuario, abrindo em outra aba.
        </p>

        <form onSubmit={enviar} className="mt-5 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="cfg-link">Endereco do formulario</Label>
            <Input
              id="cfg-link"
              type="url"
              inputMode="url"
              value={link}
              onChange={(e) => alterar(e.target.value)}
              placeholder="https://forms.gle/..."
              maxLength={300}
              disabled={carregando}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Vazio = nenhum banner. Preenchido = banner ativo na hora em que
              voce salvar.
            </p>
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {erro}
            </p>
          )}

          {salvo && (
            <p
              role="status"
              className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-success"
            >
              {link.trim()
                ? "Link salvo. O banner ja aparece no dashboard."
                : "Link removido. O banner sumiu do dashboard."}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="h-11 gap-2 font-semibold" disabled={salvando}>
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden />
                  Salvar link
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 gap-2"
              disabled={salvando || !link.trim()}
              onClick={() => alterar("")}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Limpar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">Como aparece</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Com link:</span> banner
            no topo do dashboard, com botao que abre o formulario em outra aba.
          </li>
          <li>
            <span className="font-medium text-foreground">Sem link:</span> nada
            muda no app, o dashboard fica como hoje.
          </li>
        </ul>
      </Card>
    </div>
  );
}
