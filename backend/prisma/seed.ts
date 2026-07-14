import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.edital.upsert({
    where: { id: 'edital-2026' },
    update: {},
    create: {
      id: 'edital-2026',
      nome: 'Educação Inovadora 2026',
      dataInicio: new Date('2026-01-01'),
      dataFim: new Date('2026-12-31'),
      status: 'em_andamento',
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
