"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlatformAdmin = isPlatformAdmin;
exports.assertOrgAccess = assertOrgAccess;
exports.pickOrgId = pickOrgId;
exports.assertBranchAccess = assertBranchAccess;
exports.orgIdFromBranch = orgIdFromBranch;
const common_1 = require("@nestjs/common");
function isPlatformAdmin(user) {
    return user.permissions.includes('*') || user.permissions.includes('platform.admin');
}
function assertOrgAccess(user, organizationId) {
    if (!organizationId)
        throw new common_1.ForbiddenException('organizationId required');
    if (isPlatformAdmin(user))
        return;
    if (!user.organizationIds.includes(organizationId)) {
        throw new common_1.ForbiddenException('Not a member of this organization');
    }
}
function pickOrgId(user, requested, header) {
    const id = requested || header || user.organizationIds[0];
    if (!id)
        throw new common_1.ForbiddenException('No organization context');
    if (!isPlatformAdmin(user) && !user.organizationIds.includes(id)) {
        throw new common_1.ForbiddenException('Not a member of this organization');
    }
    return id;
}
async function assertBranchAccess(prisma, user, branchId) {
    if (!branchId)
        throw new common_1.ForbiddenException('branchId required');
    if (isPlatformAdmin(user))
        return prisma.branch.findUnique({ where: { id: branchId } });
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch)
        throw new common_1.NotFoundException('Branch not found');
    if (!user.organizationIds.includes(branch.organizationId)) {
        throw new common_1.ForbiddenException('Not a member of this branch organization');
    }
    return branch;
}
async function orgIdFromBranch(prisma, branchId) {
    const b = await prisma.branch.findUnique({ where: { id: branchId }, select: { organizationId: true } });
    if (!b)
        throw new common_1.NotFoundException('Branch not found');
    return b.organizationId;
}
//# sourceMappingURL=tenant.js.map