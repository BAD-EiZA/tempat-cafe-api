export type AuthUser = {
  id: string;
  kindeId: string;
  email?: string | null;
  name?: string | null;
  permissions: string[];
  organizationIds: string[];
};

export type TenantContext = {
  organizationId?: string;
  branchId?: string;
};
