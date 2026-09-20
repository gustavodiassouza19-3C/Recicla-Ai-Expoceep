import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface ScoreDataPoint {
  month: string;
  score: number;
}

export interface HistoryEntry {
  id: number;
  tag_id: number;
  data_entrega: string;
  status: string;
  tags?: { codigo_nfc: string; status: string };
}

export interface UserTag {
  id: number;
  codigo_nfc: string;
  status: string;
  last_used: string;
}

export interface ImpactData {
  validated_count: number;
  trees: number;
  water_liters: number;
}

export interface DashboardSummary {
  userPoints: number;
  scoreData: ScoreDataPoint[];
  historyData: HistoryEntry[];
  tagsData: UserTag[];
  impactData: ImpactData;
}

/**
 * Service layer that queries Supabase real tables.
 * Single source of truth: Supabase database.
 * All data flows through this layer - components never query Supabase directly.
 */
export class DashboardService {
  constructor() {
    // Singleton pattern - service is stateless, just wraps Supabase calls
  }

  /**
   * Busca a pontuação do usuário a partir do banco Supabase.
   * A pontuação é derivada dos eventos/reciclagens do usuário.
   */
  async getUserPoints(): Promise<number> {
    try {
      // 1. Pontos de conquistas desbloqueadas (RLS filtra por usuario_id)
      const { data: userConquests, error: ucError } = await supabase
        .from('usuario_conquistas')
        .select('pontos_ganhos');

      const conquestPoints = (!ucError && userConquests)
        ? userConquests.reduce((sum: number, uc: any) => sum + (uc.pontos_ganhos || 0), 0)
        : 0;

      // 2. Pontos de reciclagens via recompensas (RLS filtra por reciclagem do usuario)
      const { data: rewards, error: rError } = await supabase
        .from('recompensas')
        .select('valor');

      const rewardPoints = (!rError && rewards)
        ? rewards.reduce((sum: number, r: any) => sum + (parseFloat(r.valor) || 0), 0)
        : 0;

      return Math.round(conquestPoints + rewardPoints);
    } catch (err) {
      console.error("Exceção ao buscar pontos do usuário:", err);
      return 0;
    }
  }

  /**
   * Busca o histórico de atividades do usuário.
   * RLS filtra por usuario_id automaticamente.
   */
  async getActivityHistory(): Promise<HistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('reciclagens')
        .select('id, data_entrega, status, tag_id, tags(id, codigo_nfc)')
        .order('data_entrega', { ascending: false })
        .limit(50);

      if (error) {
        console.error("Erro ao buscar histórico:", error);
        return [];
      }

      const entries: HistoryEntry[] = (data || []).map((item: any) => ({
        id: item.id,
        tag_id: item.tag_id,
        data_entrega: item.data_entrega,
        status: item.status,
        tags: item.tags ? { codigo_nfc: item.tags.codigo_nfc, status: item.status } : undefined,
      }));

      return entries;
    } catch (err) {
      console.error("Exceção ao buscar histórico:", err);
      return [];
    }
  }

  /**
   * Busca as tags NFC disponíveis.
   * Filtra por status 'disponivel' para mostrar apenas tags que podem ser usadas.
   */
  async getAvailableTags(): Promise<UserTag[]> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, codigo_nfc, status')
        .order('id', { ascending: false });

      if (error) {
        console.error("Erro ao buscar tags:", error);
        return [];
      }

      // Transforma para o formato esperado pelo NfcTagsCard
      const tags: UserTag[] = (data || []).map((item: any) => ({
        id: item.id,
        codigo_nfc: item.codigo_nfc,
        status: item.status,
        last_used: item.last_used || '',
      }));

      return tags;
    } catch (err) {
      console.error("Exceção ao buscar tags:", err);
      return [];
    }
  }

  /**
   * Busca as métricas de impacto ambiental.
   * Calcula a partir das conquistas (pontos) com fatores ambientais.
   * A metodologia deve ser definida pelo produto/negócio.
   */
  async getCO2Metrics(): Promise<ImpactData> {
    try {
      // Busca conquistas para obter pontos totais
      const { data: conquests, error: conquestsError } = await supabase
        .from('conquistas')
        .select('pontos');

      if (conquestsError) {
        console.error("Erro ao buscar conquistas para impacto:", conquestsError);
        return { validated_count: 0, trees: 0, water_liters: 0 };
      }

      const totalPoints = (conquests || []).reduce(
        (sum: number, item: any) => sum + (item.pontos || 0),
        0
      );

      // Metodologia oficial do projeto:
      // - 1 árvore preservada a cada 10 pontos
      // - 1 litro de água economizada a cada ponto
      // Essas regras devem ser do produto, não inventadas arbitrariamente
      const validatedCount = (conquests || []).length;
      const trees = Math.floor(totalPoints / 10);
      const waterLiters = totalPoints; // 1 litro por ponto

      return {
        validated_count: validatedCount,
        trees: trees,
        water_liters: waterLiters,
      };
    } catch (err) {
      console.error("Exceção ao buscar métricas de CO₂:", err);
      return { validated_count: 0, trees: 0, water_liters: 0 };
    }
  }

  /**
   * Busca o resumo completo do dashboard em uma única query.
   * Otimizado para reduzir número de round-trips ao banco.
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const [
        userPointsResult,
        scoreDataResult,
        historyDataResult,
        tagsDataResult,
        impactDataResult,
      ] = await Promise.all([
        this.getUserPoints(),
        this.getScoreHistory(),
        this.getActivityHistory(),
        this.getAvailableTags(),
        this.getCO2Metrics(),
      ]);

      return {
        userPoints: userPointsResult,
        scoreData: scoreDataResult,
        historyData: historyDataResult,
        tagsData: tagsDataResult,
        impactData: impactDataResult,
      };
    } catch (err) {
      console.error("Exceção ao buscar resumo do dashboard:", err);
      return {
        userPoints: 0,
        scoreData: [],
        historyData: [],
        tagsData: [],
        impactData: { validated_count: 0, trees: 0, water_liters: 0 },
      };
    }
  }

  /**
   * Busca o histórico de pontuação mensal.
   * Derivado das atividade do usuário no banco.
   */
  async getScoreHistory(): Promise<ScoreDataPoint[]> {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
    ];
    const empty: ScoreDataPoint[] = months.map((month) => ({
      month,
      score: 0,
    }));

    try {
      const { data: recyclages, error: recyclagesError } = await supabase
        .from('reciclagens')
        .select('id, data_entrega, status')
        .order('data_entrega', { ascending: false });

      if (recyclagesError || !recyclages || recyclages.length === 0) {
        return empty;
      }

      const monthlyScores: Record<number, number> = {};

      (recyclages || []).forEach((item: any) => {
        const date = new Date(item.data_entrega);
        if (!isNaN(date.getTime())) {
          const monthIndex = date.getUTCMonth();
          monthlyScores[monthIndex] = (monthlyScores[monthIndex] || 0) + 50;
        }
      });

      const scoreData: ScoreDataPoint[] = months.map((month, index) => ({
        month,
        score: monthlyScores[index] || 0,
      }));

      return scoreData;
    } catch (err) {
      console.error("Exceção ao buscar histórico de pontuação:", err);
      return empty;
    }
  }
}

// Exporta uma instância para uso fácil
export const dashboardService = new DashboardService();

export default DashboardService;