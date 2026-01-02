import { UserRole } from "@/lib/permissions";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

