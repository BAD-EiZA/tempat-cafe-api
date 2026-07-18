import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './types';

export function isPlatformAdmin(user: AuthUser) {
  return user.permissions.includes('*') || user.permissions.includes('platform.admin');
}

export function assertOrgAccess(user: AuthUser, organizationId?: string | null) {
  if (!organizationId) throw new ForbiddenException('organizationId required');
  if (isPlatformAdmin(user)) return;
  if (!user.organizationIds.includes(organizationId)) {
    throw new ForbiddenException('Not a member of this organization');
  }
}

export function pickOrgId(user: AuthUser, requested?: string | null, header?: string | null) {
  const id = requested || header || user.organizationIds[0];
  if (!id) throw new ForbiddenException('No organization context');
  if (!isPlatformAdmin(user) && !user.organizationIds.includes(id)) {
    throw new ForbiddenException('Not a member of this organization');
  }
  return id;
}

export async function assertBranchAccess(
  prisma: PrismaService,
  user: AuthUser,
  branchId?: string | null,
) {
  if (!branchId) throw new ForbiddenException('branchId required');
  if (isPlatformAdmin(user)) return prisma.branch.findUnique({ where: { id: branchId } });
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) throw new NotFoundException('Branch not found');
  if (!user.organizationIds.includes(branch.organizationId)) {
    throw new ForbiddenException('Not a member of this branch organization');
  }
  return branch;
}

export async function orgIdFromBranch(prisma: PrismaService, branchId: string) {
  const b = await prisma.branch.findUnique({ where: { id: branchId }, select: { organizationId: true } });
  if (!b) throw new NotFoundException('Branch not found');
  return b.organizationId;
}
