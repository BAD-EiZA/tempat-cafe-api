"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../auth/auth.service");
const promotions_service_1 = require("../promotions/promotions.service");
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
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
    };
    const quote = await new promotions_service_1.PromotionsService(promoPrisma).bestDiscount({
        organizationId: 'org', branchId: 'branch', subtotal: 20_000,
    });
    assert(quote.discount === 3_000, `percentage discount ${quote.discount}`);
    const invited = {
        id: 'invited-user', kindeId: 'invite-staff@example.com',
        email: 'staff@example.com', name: 'Staff', isActive: true,
    };
    let stored = invited;
    const user = {
        findUnique: async ({ where }) => stored.kindeId === where.kindeId ? stored : null,
        update: async ({ data }) => (stored = { ...stored, ...data }),
        create: async ({ data }) => (stored = { ...invited, ...data }),
    };
    const authPrisma = {
        user,
        $transaction: async (fn) => fn({ user }),
        organizationMember: {
            findMany: async ({ where }) => where.userId === invited.id
                ? [{ organizationId: 'org', role: { permissions: [] } }]
                : [],
        },
        branchMember: { findMany: async () => [] },
    };
    const resolved = await new auth_service_1.AuthService(authPrisma, {}).resolveUser({
        sub: 'kp_real', email: ' Staff@Example.com ', name: 'Real Staff',
    });
    assert(resolved.id === invited.id, 'invitation user ID was not retained');
    assert(resolved.organizationIds[0] === 'org', 'invitation membership was not claimed');
    assert(stored.kindeId === 'kp_real', 'Kinde ID was not attached');
    console.log('promo/invitation self-check OK');
}
check();
//# sourceMappingURL=promo-invite.spec-check.js.map