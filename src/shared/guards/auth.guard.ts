import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const headersList = new Headers();

    Object.keys(request.headers || {}).forEach((key) => {
      const value = request.headers[key];
      if (Array.isArray(value)) {
        value.forEach((v) => headersList.append(key, v));
      } else if (value) {
        headersList.set(key, value);
      }
    });

    try {
      const session = await auth.api.getSession({
        headers: headersList,
      });

      if (!session?.user) {
        throw new UnauthorizedException("Usuário não autenticado");
      }

      const permissions = await getUserPermissions(session.user.id);

      if (!permissions) {
        throw new UnauthorizedException("Usuário não encontrado");
      }

      if (!permissions.isActive) {
        throw new UnauthorizedException("Usuário inativo");
      }

      request.user = {
        id: session.user.id,
        email: session.user.email,
        role: permissions.role,
        isActive: permissions.isActive,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Falha na autenticação");
    }
  }
}

