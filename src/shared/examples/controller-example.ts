import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard, RolesGuard, Roles, CurrentUser, Public } from "../index";
import type { CurrentUserData } from "../decorators/current-user.decorator";

@Controller("example")
@UseGuards(AuthGuard, RolesGuard)
export class ExampleController {
  @Get("public")
  @Public()
  getPublic() {
    return { message: "Este endpoint é público" };
  }

  @Get("protected")
  getProtected(@CurrentUser() user: CurrentUserData) {
    return {
      message: "Este endpoint requer autenticação",
      user: user.email,
    };
  }

  @Get("admin-only")
  @Roles("ADMIN")
  getAdminOnly(@CurrentUser() user: CurrentUserData) {
    return {
      message: "Este endpoint é apenas para administradores",
      user: user.email,
    };
  }

  @Get("clinic-or-admin")
  @Roles("ADMIN", "CLINIC")
  getClinicOrAdmin(@CurrentUser() user: CurrentUserData) {
    return {
      message: "Este endpoint é para clínicas ou administradores",
      user: user.email,
      role: user.role,
    };
  }
}
