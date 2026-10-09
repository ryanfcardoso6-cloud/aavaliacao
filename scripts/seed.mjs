import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

function generateProtocol(prefix = 'PRT') {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(6);
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars[randomBytes[i] % chars.length];
  }
  return `${prefix}-2026-${randomStr}`;
}

async function main() {
  console.log('--- Configurando Sistema para Gelato Borelli ---');

  // 1. Configurações da Loja
  await prisma.storeConfig.upsert({
    where: { id: 'default' },
    update: {
      storeName: 'Gelato Borelli',
      logoUrl: '/logo-borelli.png',
      description: 'O verdadeiro gelato italiano, produzido artesanalmente todos os dias com ingredientes frescos.',
      welcomeMessage: 'Como foi sua experiência na Gelato Borelli?',
      subtitleMessage: 'Produzido com paixão, receitas tradicionais e ingredientes selecionados. Sua opinião nos ajuda a manter a excelência!',
      thankYouPositive: 'Molto grazie! Ficamos imensamente felizes em saber que você teve uma experiência saborosa conosco. Esperamos vê-lo novamente em breve!',
      thankYouNegative: 'Lamentamos sinceramente por não termos superado suas expectativas. Nossa gerência e equipe de mestres gelatieres já foram informados para cuidar do seu caso com total prioridade.',
      slaHours: 24,
      phone: '(16) 3600-0000',
      email: 'ouvidoria@gelatoborelli.com.br',
      address: 'Ribeirão Preto / São Paulo',
      businessHours: 'Segunda a Domingo: 11h00 às 23h00',
    },
    create: {
      id: 'default',
      storeName: 'Gelato Borelli',
      logoUrl: '/logo-borelli.png',
      description: 'O verdadeiro gelato italiano, produzido artesanalmente todos os dias com ingredientes frescos.',
      welcomeMessage: 'Como foi sua experiência na Gelato Borelli?',
      subtitleMessage: 'Produzido com paixão, receitas tradicionais e ingredientes selecionados. Sua opinião nos ajuda a manter a excelência!',
      thankYouPositive: 'Molto grazie! Ficamos imensamente felizes em saber que você teve uma experiência saborosa conosco. Esperamos vê-lo novamente em breve!',
      thankYouNegative: 'Lamentamos sinceramente por não termos superado suas expectativas. Nossa gerência e equipe de mestres gelatieres já foram informados para cuidar do seu caso com total prioridade.',
      slaHours: 24,
      phone: '(16) 3600-0000',
      email: 'ouvidoria@gelatoborelli.com.br',
      address: 'Ribeirão Preto / São Paulo',
      businessHours: 'Segunda a Domingo: 11h00 às 23h00',
    },
  });
  console.log('✔ Configuração Gelato Borelli atualizada.');

  // 2. Usuários Administrativos
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@Seguro123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const managerHash = await bcrypt.hash('Gerente@123', 10);
  const attendantHash = await bcrypt.hash('Atendente@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@loja.com' },
    update: {},
    create: {
      name: 'Diretoria Borelli (Admin)',
      email: 'admin@loja.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      active: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gerente@loja.com' },
    update: {},
    create: {
      name: 'Gerente da Gelateria',
      email: 'gerente@loja.com',
      passwordHash: managerHash,
      role: 'MANAGER',
      active: true,
    },
  });

  const attendant = await prisma.user.upsert({
    where: { email: 'atendente@loja.com' },
    update: {},
    create: {
      name: 'Atendente da Loja',
      email: 'atendente@loja.com',
      passwordHash: attendantHash,
      role: 'ATTENDANT',
      active: true,
    },
  });
  console.log('✔ Usuários administrativos confirmados.');

  // 3. Mesas
  const tablesData = [
    { number: 1, name: 'Mesa 01 - Salão Borelli', slug: 'mesa-01', token: 'tb_m1_' + generateToken() },
    { number: 2, name: 'Mesa 02 - Salão Borelli', slug: 'mesa-02', token: 'tb_m2_' + generateToken() },
    { number: 3, name: 'Mesa 03 - Varanda Externa', slug: 'mesa-03', token: 'tb_m3_' + generateToken() },
    { number: 4, name: 'Mesa 04 - Varanda Externa', slug: 'mesa-04', token: 'tb_m4_' + generateToken() },
    { number: 5, name: 'Mesa 05 - Espaço Café & Gelato', slug: 'mesa-05', token: 'tb_m5_' + generateToken() },
  ];

  for (const t of tablesData) {
    await prisma.table.upsert({
      where: { number: t.number },
      update: { name: t.name },
      create: t,
    });
  }
  console.log('✔ Mesas da gelateria cadastradas.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
