import { PrismaClient, LeadStatus, Source, Priority, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@si.com.br' },
    update: {},
    create: {
      name: 'Admin SI',
      email: 'admin@si.com.br',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agente@si.com.br' },
    update: {},
    create: {
      name: 'João Agente',
      email: 'agente@si.com.br',
      password: hashedPassword,
      role: Role.AGENT,
    },
  });

  const leads = [
    { name: 'Carlos Mendes', email: 'carlos@email.com', phone: '(31) 99801-2345', status: LeadStatus.NOVO, source: Source.SITE, priority: Priority.ALTA, notes: 'Interessado em apartamento na Savassi', userId: agent.id },
    { name: 'Ana Paula Lima', email: 'anapaula@email.com', phone: '(31) 97654-3210', status: LeadStatus.EM_CONTATO, source: Source.INDICACAO, priority: Priority.MEDIA, notes: 'Busca casa com 3 quartos em Santa Efigênia', userId: agent.id },
    { name: 'Roberto Alves', email: 'roberto@email.com', phone: '(31) 98765-1111', status: LeadStatus.QUALIFICADO, source: Source.REDES_SOCIAIS, priority: Priority.ALTA, notes: 'Budget entre R$500k-R$800k, quer fechar este mês', userId: admin.id },
    { name: 'Fernanda Costa', email: 'fernanda@email.com', phone: '(31) 91234-5678', status: LeadStatus.PROPOSTA, source: Source.ANUNCIO, priority: Priority.ALTA, notes: 'Proposta enviada para apt. na Lourdes - R$650k', userId: admin.id },
    { name: 'Marcos Oliveira', email: 'marcos@email.com', phone: '(31) 99999-8888', status: LeadStatus.FECHADO, source: Source.WHATSAPP, priority: Priority.MEDIA, notes: 'Fechou contrato: casa no Belvedere R$920k', userId: agent.id },
    { name: 'Juliana Santos', email: 'juliana@email.com', phone: '(31) 98888-7777', status: LeadStatus.PERDIDO, source: Source.SITE, priority: Priority.BAIXA, notes: 'Desistiu - achou imóvel com concorrente', userId: agent.id },
    { name: 'Paulo Rodrigues', email: 'paulo@email.com', phone: '(31) 97777-6666', status: LeadStatus.NOVO, source: Source.INDICACAO, priority: Priority.MEDIA, notes: 'Primeiro contato via indicação do Carlos Mendes', userId: agent.id },
    { name: 'Beatriz Nunes', email: 'beatriz@email.com', phone: '(31) 96666-5555', status: LeadStatus.EM_CONTATO, source: Source.REDES_SOCIAIS, priority: Priority.ALTA, notes: 'Viu anúncio no Instagram, quer cobertura', userId: admin.id },
  ];

  for (const lead of leads) {
    const created = await prisma.lead.create({ data: lead });
    await prisma.activity.create({
      data: {
        leadId: created.id,
        type: 'CRIACAO',
        message: `Lead ${created.name} adicionado ao sistema via seed.`,
      },
    });
  }

  console.log('✅ Seed concluído!');
  console.log('👤 Admin: admin@si.com.br / admin123');
  console.log('👤 Agente: agente@si.com.br / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
