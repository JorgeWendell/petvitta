import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "@/lib/permissions";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException("Usuário não encontrado no contexto");
    }

    const hasRole = requiredRoles.some((role: UserRole) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado. Papéis necessários: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }
}
