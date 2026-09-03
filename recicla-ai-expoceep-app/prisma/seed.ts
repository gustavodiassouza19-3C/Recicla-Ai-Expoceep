import { PrismaClient, Role, LacreStatus } from "../src/generated/prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@recicla.ai" },
    update: {},
    create: {
      email: "admin@recicla.ai",
      name: "Administrador",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: Role.ADMIN,
      points: 0,
    },
  });

  const coop = await prisma.user.upsert({
    where: { email: "coop@recicla.ai" },
    update: {},
    create: {
      email: "coop@recicla.ai",
      name: "Cooperativa Recicla",
      passwordHash: await bcrypt.hash("coop123", 10),
      role: Role.COOPERATIVA,
      points: 0,
    },
  });

  const citizen1 = await prisma.user.upsert({
    where: { email: "joao@recicla.ai" },
    update: {},
    create: {
      email: "joao@recicla.ai",
      name: "João Silva",
      passwordHash: await bcrypt.hash("joao123", 10),
      role: Role.CITIZEN,
      points: 120,
    },
  });

  const citizen2 = await prisma.user.upsert({
    where: { email: "maria@recicla.ai" },
    update: {},
    create: {
      email: "maria@recicla.ai",
      name: "Maria Santos",
      passwordHash: await bcrypt.hash("maria123", 10),
      role: Role.CITIZEN,
      points: 85,
    },
  });

  const station = await prisma.station.upsert({
    where: { id: "station-main" },
    update: {},
    create: {
      id: "station-main",
      name: "Estação Central Expoceep",
      address: "Av. Expoceep, 1000",
      city: "São Paulo",
      lat: -23.56,
      lng: -46.65,
    },
  });

  await prisma.pointRule.upsert({
    where: { code: "BASE_VALIDATION" },
    update: {},
    create: {
      code: "BASE_VALIDATION",
      name: "Validação Base",
      basePoints: 10,
      multiplier: 1.5,
      active: true,
    },
  });

  await prisma.pointRule.upsert({
    where: { code: "CAMPANHA_EXPOCEEP" },
    update: {},
    create: {
      code: "CAMPANHA_EXPOCEEP",
      name: "Campanha Expoceep 2x",
      basePoints: 10,
      multiplier: 2,
      active: true,
      metadata: { event: "expoceep-2025", endsAt: "2025-12-31T23:59:59Z" },
    },
  });

  const rewards = [
    {
      name: "Eco-bag Recicla Aí",
      description: "Bolsa reutilizável feita com material reciclado",
      costPoints: 80,
      stock: 50,
      partnerName: "Recicla Aí",
    },
    {
      name: "Cupom Desconto 10%",
      description: "Cupom de desconto em lojas parceiras",
      costPoints: 50,
      stock: 100,
      partnerName: "Lojas Verdes",
    },
    {
      name: "Garrafa Térmica",
      description: "Garrafa térmica de aço inoxidável",
      costPoints: 200,
      stock: 15,
      partnerName: "EcoShop",
    },
    {
      name: "Muda de Árvore",
      description: "Muda nativa para plantio",
      costPoints: 150,
      stock: 30,
      partnerName: "Instituto Plante",
    },
  ];
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { name: r.name },
      update: {},
      create: {
        ...r,
        active: true,
      },
    });
  }

  const statuses: LacreStatus[] = [
    LacreStatus.DISPONIVEL,
    LacreStatus.ASSOCIADO,
    LacreStatus.EM_USO,
    LacreStatus.COLETADO,
    LacreStatus.EM_TRIAGEM,
    LacreStatus.VALIDADO,
    LacreStatus.PONTUADO,
    LacreStatus.RESETADO,
  ];
  for (let i = 1; i <= 24; i++) {
    const code = `RCL-${String(i).padStart(5, "0")}`;
    await prisma.lacre.upsert({
      where: { code },
      update: {},
      create: {
        code,
        status: statuses[i % statuses.length],
        ownerId: i % 3 === 0 ? citizen1.id : i % 3 === 1 ? citizen2.id : null,
        stationId: station.id,
      },
    });
  }

  console.log("✅ Seed concluído!");
  console.log(`   Admin:   ${admin.email} (admin123)`);
  console.log(`   Coop:    ${coop.email} (coop123)`);
  console.log(`   Cidadão: ${citizen1.email} (joao123)`);
  console.log(`   Cidadão: ${citizen2.email} (maria123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
