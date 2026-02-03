export interface AdminSessionResponse {
  adminUserId: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "SUPERADMIN" | "ADMIN";
  userName?: string;
}
