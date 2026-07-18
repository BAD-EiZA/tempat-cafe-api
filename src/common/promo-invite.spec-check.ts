/** Runnable self-check: npm run check:promo-invite */
import { AuthService } from '../auth/auth.service';
import { PromotionsService } from '../promotions/promotions.service';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function check() {
  const promotion = {
    id: 'promo',
    type: 'PERCENT',
    rules: { percentBps: 1_500 },
    schedules: [],
    stackable: false,
  };
  const promoPrisma = {
    promotion: { findMany: async () => [promotion] },
  } as any;
  const quote = await new PromotionsService(promoPrisma).bestDiscount({
    organizationId: 'org', branchId: 'branch', subtotal: 20_000,
  });
  assert(quote.discount === 3_000, `percentage discount ${quote.discount}`);

  const invited = {
    id: 'invited-user', kindeId: 'invite-staff@example.com',
    email: 'staff@example.com', name: 'Staff', isActive: true,
  };
  let stored = invited;
  const user = {
    findUnique: async ({ where }: any) => stored.kindeId === where.kindeId ? stored : null,
    update: async ({ data }: any) => (stored = { ...stored, ...data }),
    create: async ({ data }: any) => (stored = { ...invited, ...data }),
  };
  const authPrisma = {
    user,
    $transaction: async (fn: any) => fn({ user }),
    organizationMember: {
      findMany: async ({ where }: any) => where.userId === invited.id
        ? [{ organizationId: 'org', role: { permissions: [] } }]
        : [],
    },
    branchMember: { findMany: async () => [] },
  } as any;
  const resolved = await new AuthService(authPrisma, {} as any).resolveUser({
    sub: 'kp_real', email: ' Staff@Example.com ', name: 'Real Staff',
  });
  assert(resolved.id === invited.id, 'invitation user ID was not retained');
  assert(resolved.organizationIds[0] === 'org', 'invitation membership was not claimed');
  assert(stored.kindeId === 'kp_real', 'Kinde ID was not attached');

  console.log('promo/invitation self-check OK');
}

check();
