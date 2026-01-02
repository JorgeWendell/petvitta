# Sistema de Autenticação e Autorização - NestJS

Este módulo implementa guards e decorators para autenticação e autorização baseados em papéis (roles) no NestJS.

## Papéis (Roles)

O sistema suporta três papéis:

- `ADMIN`: Administrador do sistema
- `CLINIC`: Clínica veterinária credenciada
- `TUTOR`: Tutor (cliente) do sistema

## Guards

### AuthGuard

Guarda que verifica se o usuário está autenticado através do Better Auth.

**Uso:**

```typescript
@UseGuards(AuthGuard)
@Get("protected")
getProtected() {
  return { message: "Endpoint protegido" };
}
```

### RolesGuard

Guarda que verifica se o usuário possui os papéis necessários para acessar o endpoint.

**Uso:**

```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles("ADMIN")
@Get("admin-only")
getAdminOnly() {
  return { message: "Apenas administradores" };
}
```

## Decorators

### @Public()

Marca um endpoint como público, permitindo acesso sem autenticação.

**Uso:**

```typescript
@Public()
@Get("public")
getPublic() {
  return { message: "Endpoint público" };
}
```

### @Roles(...roles)

Especifica quais papéis podem acessar o endpoint. Pode receber um ou mais papéis.

**Uso:**

```typescript
@Roles("ADMIN")
@Get("admin-only")
getAdminOnly() {
  return { message: "Apenas admin" };
}

@Roles("ADMIN", "CLINIC")
@Get("admin-or-clinic")
getAdminOrClinic() {
  return { message: "Admin ou clínica" };
}
```

### @CurrentUser()

Extrai o usuário autenticado do contexto da requisição.

**Uso:**

```typescript
@Get("profile")
getProfile(@CurrentUser() user: CurrentUserData) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
```

## Exemplo Completo

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard, RolesGuard, Roles, CurrentUser, Public } from "@/shared";
import { CurrentUserData } from "@/shared/decorators/current-user.decorator";

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
```

## Estrutura de Arquivos

```
src/shared/
├── decorators/
│   ├── roles.decorator.ts       # Decorator @Roles()
│   ├── current-user.decorator.ts # Decorator @CurrentUser()
│   └── public.decorator.ts      # Decorator @Public()
├── guards/
│   ├── auth.guard.ts            # Guard de autenticação
│   └── roles.guard.ts           # Guard de autorização por papéis
├── types/
│   └── auth.types.ts            # Tipos TypeScript
├── examples/
│   └── controller-example.ts    # Exemplo de uso
└── index.ts                     # Exportações centralizadas
```

## Notas Importantes

1. O `AuthGuard` deve sempre ser usado antes do `RolesGuard`
2. O `@Public()` decorator permite acesso sem autenticação
3. O `@Roles()` decorator requer que o `RolesGuard` esteja ativo
4. O `@CurrentUser()` só funciona após a autenticação pelo `AuthGuard`
