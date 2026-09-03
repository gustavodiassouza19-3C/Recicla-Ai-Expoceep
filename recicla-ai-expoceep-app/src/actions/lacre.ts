"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  canTransition,
  LACRE_STATUS_LABELS,
  type LacreStatus,
} from "@/lib/lacre-state";
import type { Role } from "@/generated/prisma/client";

export async function associateLacreAction(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  const code = String(formData.get("code") || "").trim().toUpperCase();
  if (!userId || !code) {
    return { ok: false, error: "Usuário e código do lacre são obrigatórios." };
  }
  try {
    const lacre = await prisma.lacre.findUnique({ where: { code } });
    if (!lacre) {
      return { ok: false, error: "Lacre não encontrado." };
    }
    if (lacre.ownerId && lacre.ownerId !== userId) {
      return { ok: false, error: "Lacre já vinculado a outro cidadão." };
    }
    if (!canTransition(lacre.status, "ASSOCIADO" as LacreStatus)) {
      return {
        ok: false,
        error: `Lacre em status ${LACRE_STATUS_LABELS[lacre.status]} não pode ser associado.`,
      };
    }
    const updated = await prisma.$transaction(async (tx) => {
      const updated = await tx.lacre.update({
        where: { id: lacre.id },
        data: {
          ownerId: userId,
          status: "ASSOCIADO",
          station: undefined,
        },
        include: { owner: true },
      });
      await tx.lacreHistory.create({
        data: {
          lacreId: lacre.id,
          userId,
          fromStatus: lacre.status,
          toStatus: "ASSOCIADO",
          note: "Lacre associado ao cidadão",
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: userId,
          targetType: "LACRE",
          targetId: lacre.id,
          action: "ASSOCIATE",
          metadata: { code, from: lacre.status, to: "ASSOCIADO" },
        },
      });
      return updated;
    });
    revalidatePath("/dashboard");
    return { ok: true, lacre: updated };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Erro ao associar lacre." };
  }
}

export async function validateLacresAction(formData: FormData) {
  const coopId = String(formData.get("coopId") || "");
  const rawCodes = String(formData.get("codes") || "");
  const codes = rawCodes
    .split(/[\s,;]+/)
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  if (!coopId || codes.length === 0) {
    return { ok: false, error: "Cooperativa e códigos são obrigatórios." };
  }
  try {
    const coop = await prisma.user.findUnique({
      where: { id: coopId },
    });
    if (!coop || (coop.role !== "COOPERATIVA" && (coop.role as unknown as string) !== "COOPERATIVA")) {
      return { ok: false, error: "Usuário não é uma cooperativa válida." };
    }
    const pointRule = await prisma.pointRule.findFirst({
      where: { active: true, code: "BASE_VALIDATION" },
    });
    const basePoints = pointRule ? pointRule.basePoints : 10;
    const multiplier = pointRule ? pointRule.multiplier : 1;
    const pointsPerLacre = Math.round(basePoints * multiplier);

    const results: Array<{
      code: string;
      ok: boolean;
      error?: string;
      pointsAwarded?: number;
    }> = [];

    await prisma.$transaction(async (tx) => {
      for (const code of codes) {
        const lacre = await tx.lacre.findUnique({ where: { code } });
        if (!lacre) {
          results.push({ code, ok: false, error: "Não encontrado" });
          continue;
        }
        if (lacre.status === "VALIDADO" || lacre.status === "PONTUADO") {
          results.push({ code, ok: false, error: "Já validado" });
          continue;
        }
        if (lacre.status === "DUPLICADO" || lacre.status === "SUSPEITO") {
          results.push({ code, ok: false, error: "Suspeita de fraude" });
          await tx.auditLog.create({
            data: {
              actorId: coopId,
              targetType: "LACRE",
              targetId: lacre.id,
              action: "SUSPECTED_DUPLICATE",
              metadata: { code, status: lacre.status },
            },
          });
          continue;
        }
        if (!canTransition(lacre.status, "EM_TRIAGEM" as LacreStatus)) {
          results.push({
            code,
            ok: false,
            error: `Status ${LACRE_STATUS_LABELS[lacre.status]} inválido`,
          });
          continue;
        }
        await tx.lacre.update({
          where: { id: lacre.id },
          data: {
            status: "EM_TRIAGEM",
          },
        });
        await tx.lacreHistory.create({
          data: {
            lacreId: lacre.id,
            userId: coopId,
            fromStatus: lacre.status,
            toStatus: "EM_TRIAGEM",
            note: "Lacre em triagem",
          },
        });
        const validated = await tx.lacre.update({
          where: { id: lacre.id },
          data: {
            status: "VALIDADO",
            occurredAt: new Date(),
          },
        });
        await tx.lacreHistory.create({
          data: {
            lacreId: lacre.id,
            userId: coopId,
            fromStatus: "EM_TRIAGEM",
            toStatus: "VALIDADO",
            note: "Lacre validado",
          },
        });
        if (validated.ownerId) {
          await tx.user.update({
            where: { id: validated.ownerId },
            data: { points: { increment: pointsPerLacre } },
          });
          await tx.lacre.update({
            where: { id: lacre.id },
            data: { status: "PONTUADO" },
          });
          await tx.lacreHistory.create({
            data: {
              lacreId: lacre.id,
              userId: coopId,
              fromStatus: "VALIDADO",
              toStatus: "PONTUADO",
              note: `${pointsPerLacre} pontos creditados`,
            },
          });
          await tx.auditLog.create({
            data: {
              actorId: coopId,
              targetType: "LACRE",
              targetId: lacre.id,
              action: "POINTS_AWARDED",
              metadata: { code, points: pointsPerLacre, userId: validated.ownerId },
            },
          });
        }
        results.push({ code, ok: true, pointsAwarded: pointsPerLacre });
      }
    });
    revalidatePath("/cooperativa");
    revalidatePath("/dashboard");
    return {
      ok: true,
      summary: {
        total: codes.length,
        success: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
        points: results.reduce((s, r) => s + (r.pointsAwarded || 0), 0),
      },
      results,
    };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Erro ao validar lacres." };
  }
}

export async function resetLacreAction(formData: FormData) {
  const lacreId = String(formData.get("lacreId") || "");
  if (!lacreId) {
    return { ok: false, error: "ID do lacre é obrigatório." };
  }
  try {
    const lacre = await prisma.lacre.findUnique({ where: { id: lacreId } });
    if (!lacre) return { ok: false, error: "Lacre não encontrado." };
    if (!canTransition(lacre.status, "RESETADO" as LacreStatus)) {
      return {
        ok: false,
        error: `Lacre em status ${LACRE_STATUS_LABELS[lacre.status]} não pode ser resetado.`,
      };
    }
    await prisma.$transaction(async (tx) => {
      await tx.lacre.update({
        where: { id: lacre.id },
        data: {
          status: "RESETADO",
          ownerId: null,
          stationId: null,
          occurredAt: null,
        },
      });
      await tx.lacreHistory.create({
        data: {
          lacreId: lacre.id,
          fromStatus: lacre.status,
          toStatus: "RESETADO",
          note: "Lacre resetado para estoque",
        },
      });
      await tx.lacre.update({
        where: { id: lacre.id },
        data: { status: "DISPONIVEL" },
      });
      await tx.lacreHistory.create({
        data: {
          lacreId: lacre.id,
          fromStatus: "RESETADO",
          toStatus: "DISPONIVEL",
          note: "Lacre disponível para nova associação",
        },
      });
      await tx.auditLog.create({
        data: {
          targetType: "LACRE",
          targetId: lacre.id,
          action: "RESET",
          metadata: { code: lacre.code },
        },
      });
    });
    revalidatePath("/admin");
    revalidatePath("/cooperativa");
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Erro ao resetar lacre." };
  }
}

export async function getLacreStatusAction(code: string) {
  try {
    const lacre = await prisma.lacre.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        owner: { select: { id: true, name: true } },
        history: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!lacre) return { ok: false, error: "Lacre não encontrado." };
    return { ok: true, lacre };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Erro ao buscar lacre." };
  }
}

export type ValidateLacresResponse = Awaited<
  ReturnType<typeof validateLacresAction>
>;
export type AssociateLacreResponse = Awaited<
  ReturnType<typeof associateLacreAction>
>;
export type ResetLacreResponse = Awaited<ReturnType<typeof resetLacreAction>>;
