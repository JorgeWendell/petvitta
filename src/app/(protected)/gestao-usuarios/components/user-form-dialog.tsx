"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useCreateUser } from "@/hooks/mutations/use-create-user";
import { useUpdateUser } from "@/hooks/mutations/use-update-user";

const userFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nome é obrigatório" })
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" })
    .trim(),
  email: z
    .string()
    .email({ message: "E-mail inválido" })
    .min(1, { message: "E-mail é obrigatório" })
    .max(255, { message: "E-mail deve ter no máximo 255 caracteres" })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" })
    .max(100, { message: "Senha deve ter no máximo 100 caracteres" })
    .regex(/[A-Z]/, {
      message: "Senha deve conter pelo menos uma letra maiúscula",
    })
    .regex(/[a-z]/, {
      message: "Senha deve conter pelo menos uma letra minúscula",
    })
    .regex(/[0-9]/, {
      message: "Senha deve conter pelo menos um número",
    })
    .trim()
    .optional(),
  role: z.enum(["ADMIN", "CLINIC", "TUTOR"], {
    required_error: "Papel é obrigatório",
  }),
  isActive: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userFormSchema>;

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLINIC" | "TUTOR";
  isActive: boolean;
};

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess?: () => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const isEditing = !!user;

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "TUTOR",
      isActive: true,
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } else if (open) {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "TUTOR",
        isActive: true,
      });
    }
  }, [user, open, form]);

  const onSubmit = async (values: UserFormData) => {
    if (isEditing && user) {
      updateUserMutation.mutate(
        {
          id: user.id,
          name: values.name,
          email: values.email,
          role: values.role,
          isActive: values.isActive,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    } else {
      if (!values.password) {
        form.setError("password", {
          message: "Senha é obrigatória para novos usuários",
        });
        return;
      }

      createUserMutation.mutate(
        {
          name: values.name,
          email: values.email,
          password: values.password!,
          role: values.role,
          isActive: values.isActive,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    }
  };

  const isLoading =
    createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do usuário"
              : "Preencha os dados para criar um novo usuário"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome completo"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <Field>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="usuario@exemplo.com"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              {!isEditing && (
                <Field>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FieldDescription>
                          A senha deve conter pelo menos 8 caracteres, incluindo
                          letras maiúsculas, minúsculas e números.
                        </FieldDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
              )}

              <Field>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="TUTOR">Tutor</option>
                          <option value="CLINIC">Clínica</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <Field>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          className="h-4 w-4 rounded border-input disabled:opacity-50"
                        />
                        <FormLabel className="!mt-0 cursor-pointer">
                          Usuário ativo
                        </FormLabel>
                      </div>
                      <FieldDescription>
                        Usuários inativos não podem fazer login no sistema
                      </FieldDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? "Atualizando..." : "Criando..."}
                  </>
                ) : isEditing ? (
                  "Atualizar"
                ) : (
                  "Criar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
