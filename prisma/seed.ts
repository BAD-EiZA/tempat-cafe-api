import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROLES = [
  { code: 'PLATFORM_SUPER_ADMIN', name: 'Platform Super Admin' },
  { code: 'PLATFORM_FINANCE', name: 'Platform Finance' },
  { code: 'PLATFORM_SUPPORT', name: 'Platform Support' },
  { code: 'OWNER', name: 'Owner' },
  { code: 'BRANCH_MANAGER', name: 'Branch Manager' },
  { code: 'CASHIER', name: 'Cashier' },
  { code: 'KITCHEN', name: 'Kitchen' },
  { code: 'BARISTA', name: 'Barista' },
  { code: 'WAITER', name: 'Waiter' },
  { code: 'FINANCE_VIEWER', name: 'Finance Viewer' },
];

const PERMISSIONS = [
  'platform.admin',
  'merchant.read',
  'merchant.update',
  'branch.manage',
  'menu.manage',
  'order.create',
  'order.accept',
  'order.cancel',
  'payment.refund.request',
  'payment.refund.approve',
  'payout.view',
  'payout.manage',
  'ledger.adjust',
  'reservation.manage',
  'loyalty.adjust',
  'feedback.respond',
  'printer.manage',
  'report.export',
  'homepage.manage',
  'table.manage',
  'pos.operate',
  'kitchen.operate',
];

const ROLE_PERMS: Record<string, string[]> = {
  PLATFORM_SUPER_ADMIN: ['*'],
  PLATFORM_FINANCE: [
    'platform.admin',
    'payout.view',
    'payout.manage',
    'ledger.adjust',
    'payment.refund.approve',
    'report.export',
  ],
  PLATFORM_SUPPORT: ['merchant.read', 'merchant.update', 'platform.admin'],
  OWNER: [
    'merchant.read',
    'merchant.update',
    'branch.manage',
    'menu.manage',
    'order.create',
    'order.accept',
    'order.cancel',
    'payment.refund.request',
    'payout.view',
    'reservation.manage',
    'loyalty.adjust',
    'feedback.respond',
    'printer.manage',
    'report.export',
    'homepage.manage',
    'table.manage',
    'pos.operate',
    'kitchen.operate',
  ],
  BRANCH_MANAGER: [
    'merchant.read',
    'branch.manage',
    'menu.manage',
    'order.create',
    'order.accept',
    'order.cancel',
    'payment.refund.request',
    'reservation.manage',
    'feedback.respond',
    'printer.manage',
    'report.export',
    'table.manage',
    'pos.operate',
    'kitchen.operate',
  ],
  CASHIER: ['order.create', 'order.accept', 'order.cancel', 'pos.operate', 'payment.refund.request'],
  KITCHEN: ['kitchen.operate'],
  BARISTA: ['kitchen.operate'],
  WAITER: ['order.accept', 'pos.operate'],
  FINANCE_VIEWER: ['payout.view', 'report.export', 'merchant.read'],
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

async function seedRoles() {
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p },
      create: { code: p, name: p },
      update: {},
    });
  }
  await prisma.permission.upsert({
    where: { code: '*' },
    create: { code: '*', name: 'All permissions' },
    update: {},
  });
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      create: r,
      update: { name: r.name },
    });
    for (const code of ROLE_PERMS[r.code] || []) {
      const perm = await prisma.permission.findUnique({ where: { code } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        create: { roleId: role.id, permissionId: perm.id },
        update: {},
      });
    }
  }
}

async function seedDemo() {
  const ownerRole = await prisma.role.findUnique({ where: { code: 'OWNER' } });
  const adminRole = await prisma.role.findUnique({ where: { code: 'PLATFORM_SUPER_ADMIN' } });
  if (!ownerRole || !adminRole) throw new Error('roles missing');

  const platformUser = await prisma.user.upsert({
    where: { kindeId: 'dev-platform-admin' },
    create: {
      kindeId: 'dev-platform-admin',
      email: 'admin@platform.local',
      name: 'Platform Admin',
    },
    update: { email: 'admin@platform.local', name: 'Platform Admin' },
  });

  // platform admin needs an org membership with PLATFORM_SUPER_ADMIN role for permissions
  let platformOrg = await prisma.organization.findUnique({ where: { slug: 'platform' } });
  if (!platformOrg) {
    platformOrg = await prisma.organization.create({
      data: {
        name: 'Platform',
        slug: 'platform',
        status: 'APPROVED',
        email: 'admin@platform.local',
      },
    });
  }
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: { organizationId: platformOrg.id, userId: platformUser.id },
    },
    create: {
      organizationId: platformOrg.id,
      userId: platformUser.id,
      roleId: adminRole.id,
    },
    update: { roleId: adminRole.id },
  });

  const ownerUser = await prisma.user.upsert({
    where: { kindeId: 'dev-owner' },
    create: {
      kindeId: 'dev-owner',
      email: 'owner@dev.local',
      name: 'Owner Dev',
    },
    update: { email: 'owner@dev.local', name: 'Owner Dev' },
  });

  let org = await prisma.organization.findUnique({ where: { slug: 'demo-cafe' } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Demo Cafe',
        slug: 'demo-cafe',
        status: 'APPROVED',
        email: 'owner@dev.local',
        phone: '08123456789',
      },
    });
    await prisma.merchantBalance.create({ data: { organizationId: org.id } });
    for (const code of ['AVAILABLE', 'PENDING', 'TIP_PAYABLE']) {
      await prisma.merchantLedgerAccount.create({
        data: { organizationId: org.id, code, name: code },
      });
    }
  }

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: ownerUser.id } },
    create: { organizationId: org.id, userId: ownerUser.id, roleId: ownerRole.id },
    update: { roleId: ownerRole.id },
  });

  // also grant platform admin access to demo org as owner for convenience
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: platformUser.id } },
    create: { organizationId: org.id, userId: platformUser.id, roleId: adminRole.id },
    update: {},
  });

  let brand = await prisma.brand.findFirst({ where: { organizationId: org.id, slug: 'demo-cafe' } });
  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        organizationId: org.id,
        name: 'Demo Cafe',
        slug: 'demo-cafe',
      },
    });
  }

  let branch = await prisma.branch.findFirst({ where: { organizationId: org.id, slug: 'main' } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        organizationId: org.id,
        brandId: brand.id,
        name: 'Cabang Utama',
        slug: 'main',
        status: 'ACTIVE',
        taxBps: 1100,
        serviceChargeBps: 500,
      },
    });
    await prisma.kitchenStation.createMany({
      data: [
        { branchId: branch.id, name: 'Kitchen', code: 'KITCHEN', sortOrder: 1 },
        { branchId: branch.id, name: 'Barista', code: 'BARISTA', sortOrder: 2 },
      ],
    });
  }

  {
    const existing = await prisma.loyaltyRule.findFirst({ where: { organizationId: org.id } });
    if (!existing) await prisma.loyaltyRule.create({ data: { organizationId: org.id } });
  }

  const tierCount = await prisma.membershipTier.count({ where: { organizationId: org.id } });
  if (!tierCount) {
    await prisma.membershipTier.createMany({
      data: [
        { organizationId: org.id, code: 'MEMBER', name: 'Member', minPoints: 0, sortOrder: 0 },
        { organizationId: org.id, code: 'SILVER', name: 'Silver', minPoints: 500, sortOrder: 1 },
        { organizationId: org.id, code: 'GOLD', name: 'Gold', minPoints: 2000, sortOrder: 2 },
      ],
    });
  }

  let menu = await prisma.menu.findFirst({ where: { brandId: brand.id } });
  if (!menu) {
    menu = await prisma.menu.create({
      data: { brandId: brand.id, branchId: branch.id, name: 'Menu Utama', isActive: true },
    });
    const drinks = await prisma.menuCategory.create({
      data: { menuId: menu.id, name: 'Minuman', sortOrder: 0 },
    });
    const food = await prisma.menuCategory.create({
      data: { menuId: menu.id, name: 'Makanan', sortOrder: 1 },
    });
    const stations = await prisma.kitchenStation.findMany({ where: { branchId: branch.id } });
    const bar = stations.find((s) => s.code === 'BARISTA');
    const kit = stations.find((s) => s.code === 'KITCHEN');

    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: drinks.id,
          name: 'Espresso',
          slug: 'espresso',
          basePrice: 22000,
          stationId: bar?.id,
          description: 'Single shot',
        },
        {
          categoryId: drinks.id,
          name: 'Caffe Latte',
          slug: 'caffe-latte',
          basePrice: 32000,
          stationId: bar?.id,
          description: 'Espresso + steamed milk',
        },
        {
          categoryId: food.id,
          name: 'Croissant',
          slug: 'croissant',
          basePrice: 28000,
          stationId: kit?.id,
          description: 'Butter croissant',
        },
        {
          categoryId: food.id,
          name: 'Club Sandwich',
          slug: 'club-sandwich',
          basePrice: 45000,
          stationId: kit?.id,
        },
      ],
    });
  }

  let area = await prisma.area.findFirst({ where: { branchId: branch.id } });
  if (!area) {
    area = await prisma.area.create({
      data: { branchId: branch.id, name: 'Indoor', type: 'INDOOR' },
    });
  }
  const tableCount = await prisma.cafeTable.count({ where: { branchId: branch.id } });
  if (!tableCount) {
    for (const name of ['T1', 'T2', 'T3', 'T4']) {
      const table = await prisma.cafeTable.create({
        data: { branchId: branch.id, areaId: area.id, name, capacity: 4, status: 'AVAILABLE' },
      });
      await prisma.tableQrToken.create({
        data: { tableId: table.id, token: `demo-${slugify(name)}-${table.id.slice(0, 8)}` },
      });
    }
  }

  await prisma.reservationSetting.upsert({
    where: { branchId: branch.id },
    create: { branchId: branch.id, enabled: true },
    update: { enabled: true },
  });

  const page = await prisma.homepagePage.findFirst({ where: { organizationId: org.id, slug: 'demo-cafe' } });
  if (!page) {
    await prisma.homepagePage.create({
      data: {
        organizationId: org.id,
        brandId: brand.id,
        branchId: branch.id,
        slug: 'demo-cafe',
        title: 'Demo Cafe',
        versions: {
          create: {
            version: 1,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            design: { primaryColor: '#1a1a1a', secondaryColor: '#c4a574' },
            sections: {
              create: [
                {
                  type: 'hero',
                  sortOrder: 0,
                  content: { title: 'Demo Cafe', subtitle: 'Kopi & makanan ringan' },
                },
                {
                  type: 'about',
                  sortOrder: 1,
                  content: { body: 'Kafe demo untuk testing platform.' },
                },
                {
                  type: 'cta',
                  sortOrder: 2,
                  content: { menuLabel: 'Lihat Menu', reservationLabel: 'Reservasi' },
                },
              ],
            },
          },
        },
      },
    });
    const created = await prisma.homepagePage.findFirst({
      where: { organizationId: org.id, slug: 'demo-cafe' },
      include: { versions: true },
    });
    if (created?.versions[0]) {
      await prisma.homepagePage.update({
        where: { id: created.id },
        data: { publishedVersionId: created.versions[0].id },
      });
    }
  }

  const demoCode = await prisma.voucherCode.findUnique({ where: { code: 'DEMO10' } });
  if (!demoCode) {
    await prisma.voucher.create({
      data: {
        organizationId: org.id,
        name: 'Diskon 10rb',
        type: 'FIXED',
        value: 10000,
        totalLimit: 1000,
        isActive: true,
        codes: { create: { code: 'DEMO10' } },
      },
    });
  }

  console.log('Demo seed:');
  console.log('  Platform admin kindeId: dev-platform-admin (email admin@platform.local)');
  console.log('  Owner kindeId: dev-owner (email owner@dev.local)');
  console.log('  Cafe slug: demo-cafe  branch: main');
  console.log('  Public: /c/demo-cafe  menu: /c/demo-cafe/menu');
}

async function main() {
  await seedRoles();
  console.log('Seed complete: roles & permissions');
  await seedDemo();
  console.log('Seed complete: demo merchant + platform admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
