"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function redeemRewardAction(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  const rewardId = String(formData.get("rewardId") || "");
  if (!userId || !rewardId) {
    return { ok: false, error: "Usuário e recompensa são obrigatórios." };
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, points: true, name: true },
      });
      if (!user) throw new Error("Usuário não encontrado.");

      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });
      if (!reward) throw new Error("Recompensa não encontrada.");
      if (!reward.active) throw new Error("Recompensa indisponível.");
      if (reward.stock <= 0) throw new Error("Sem estoque para esta recompensa.");
      if (user.points < reward.costPoints) {
        throw new Error("Pontos insuficientes.");
      }

      const [updatedUser, updatedReward, redemption] = await Promise.all([
        tx.user.update({
          where: { id: userId },
          data: { points: { decrement: reward.costPoints } },
        }),
        tx.reward.update({
          where: { id: rewardId },
          data: { stock: { decrement: 1 } },
        }),
        tx.redemption.create({
          data: {
            userId,
            rewardId,
            pointsCost: reward.costPoints,
            status: "CONFIRMADA",
          },
        }),
      ]);

      await tx.auditLog.create({
        data: {
          actorId: userId,
          targetType: "REDEMPTION",
          targetId: redemption.id,
          action: "REDEEM",
          metadata: {
            rewardId,
            rewardName: reward.name,
            cost: reward.costPoints,
            userPointsBefore: user.points,
            userPointsAfter: updatedUser.points,
          },
        },
      });

      return { user: updatedUser, reward: updatedReward, redemption };
    });
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return {
      ok: true,
      redemptionId: result.redemption.id,
      pointsRemaining: result.user.points,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao resgatar recompensa.";
    return { ok: false, error: message };
  }
}

export type RedeemRewardResponse = Awaited<ReturnType<typeof redeemRewardAction>>;
