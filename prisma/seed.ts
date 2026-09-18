import { PrismaClient, BillingInterval } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Configurando Catálogo Definitivo: 2 Planes 100% Pago Único ---');

  // Limpiar precios antiguos no utilizados
  await prisma.planPrice.deleteMany({});
  await prisma.plan.deleteMany({});

  // 1. Plan Personal (1 PC)
  const personalPlan = await prisma.plan.create({
    data: {
      id: 'personal',
      name: 'Plan Personal (1 PC)',
      description: 'Licencia permanente para 1 computadora. Pago único sin suscripciones.',
      maxDevices: 1,
      hasAutomation: true,
      hasDuplicates: true,
      featuresDisplay: [
        'Licencia para 1 computadora',
        'Organización instantánea de archivos en 1-clic',
        'Buscador y reciclaje de duplicados (SHA-256)',
        'Monitor automático en segundo plano',
        'Actualizaciones de la versión 1.x',
        'Pago único para siempre (sin mensualidades)',
      ],
      isActive: true,
    },
  });

  // 2. Plan PRO Multiequipo (3 PCs)
  const proPlan = await prisma.plan.create({
    data: {
      id: 'pro',
      name: 'Plan PRO Multiequipo (3 PCs)',
      description: 'Licencia permanente para hasta 3 computadoras. Ideal para hogar y trabajo.',
      maxDevices: 3,
      hasAutomation: true,
      hasDuplicates: true,
      featuresDisplay: [
        'Licencia para hasta 3 computadoras',
        'Organización instantánea de archivos en 1-clic',
        'Buscador y reciclaje de duplicados (SHA-256)',
        'Monitor automático en segundo plano',
        'Reglas de enrutamiento inteligente personalizadas',
        'Actualizaciones de la versión 1.x y soporte prioritario',
        'Pago único para siempre (sin mensualidades)',
      ],
      isActive: true,
    },
  });

  // 3. Precios 100% Pago Único (Soles y Dólares)
  const prices = [
    // Plan Personal (1 PC)
    {
      id: 'price_personal_pen_lifetime',
      planId: 'personal',
      currency: 'PEN',
      amount: 19.90,
      billingInterval: BillingInterval.LIFETIME,
    },
    {
      id: 'price_personal_usd_lifetime',
      planId: 'personal',
      currency: 'USD',
      amount: 5.99,
      billingInterval: BillingInterval.LIFETIME,
    },
    // Plan PRO Multiequipo (3 PCs)
    {
      id: 'price_pro_pen_lifetime',
      planId: 'pro',
      currency: 'PEN',
      amount: 29.90,
      billingInterval: BillingInterval.LIFETIME,
    },
    {
      id: 'price_pro_usd_lifetime',
      planId: 'pro',
      currency: 'USD',
      amount: 8.99,
      billingInterval: BillingInterval.LIFETIME,
    },
  ];

  for (const p of prices) {
    await prisma.planPrice.create({
      data: {
        id: p.id,
        planId: p.planId,
        currency: p.currency,
        amount: p.amount,
        billingInterval: p.billingInterval,
        isActive: true,
      },
    });
  }

  console.log('✅ Catálogo actualizado exitosamente con los 2 planes de Pago Único.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
