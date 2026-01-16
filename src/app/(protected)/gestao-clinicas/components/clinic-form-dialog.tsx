"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

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

import { useCreateClinic } from "@/hooks/mutations/use-create-clinic";
import { useUpdateClinic } from "@/hooks/mutations/use-update-clinic";
import { useUsers } from "@/hooks/queries/use-users";

const clinicFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nome é obrigatório" })
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(200, { message: "Nome deve ter no máximo 200 caracteres" })
    .trim(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email({ message: "E-mail inválido" })
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  userId: z.string().min(1, { message: "Usuário é obrigatório" }),
  status: z.enum(["ATIVO", "INATIVO"]),
});

type ClinicFormData = z.infer<typeof clinicFormSchema>;

type Clinic = {
  id: string;
  name: string;
  cnpj?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  userId: string;
  status: "ATIVO" | "INATIVO";
};

interface ClinicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic?: Clinic | null;
  onSuccess?: () => void;
}

// Funções de máscara
const maskCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 14) {
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return value;
};

const maskPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 0) return "";
  
  if (numbers.length <= 2) {
    return numbers;
  }
  
  let result = `(${numbers.slice(0, 2)}`;
  
  if (numbers.length > 2) {
    result += `) ${numbers[2]}`;
  }
  
  if (numbers.length > 3) {
    const remaining = numbers.slice(3);
    if (remaining.length <= 4) {
      result += ` ${remaining}`;
    } else {
      result += ` ${remaining.slice(0, 4)}-${remaining.slice(4, 8)}`;
    }
  }
  
  return result;
};

const maskCEP = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d)/, "$1-$2");
  }
  return value;
};

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function ClinicFormDialog({
  open,
  onOpenChange,
  clinic,
  onSuccess,
}: ClinicFormDialogProps) {
  const isEditing = !!clinic;
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const createClinicMutation = useCreateClinic();
  const updateClinicMutation = useUpdateClinic();

  // Buscar usuários com role CLINIC para o select
  const { data: usersData } = useUsers({ role: "CLINIC", limit: 100 });
  const users = usersData?.users || [];

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      userId: "",
      status: "ATIVO",
    },
  });

  useEffect(() => {
    if (clinic && open) {
      form.reset({
        name: clinic.name,
        cnpj: clinic.cnpj || "",
        phone: clinic.phone || "",
        email: clinic.email || "",
        address: clinic.address || "",
        city: clinic.city || "",
        state: clinic.state || "",
        zipCode: clinic.zipCode || "",
        userId: clinic.userId,
        status: clinic.status,
      });
    } else if (open) {
      form.reset({
        name: "",
        cnpj: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        userId: "",
        status: "ATIVO",
      });
    }
  }, [clinic, open, form]);

  const onSubmit = async (values: ClinicFormData) => {
    if (isEditing && clinic) {
      updateClinicMutation.mutate(
        {
          id: clinic.id,
          name: values.name,
          cnpj: values.cnpj,
          phone: values.phone,
          email: values.email,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          userId: values.userId,
          status: values.status,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    } else {
      createClinicMutation.mutate(
        {
          name: values.name,
          cnpj: values.cnpj,
          phone: values.phone,
          email: values.email,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          userId: values.userId,
          status: values.status,
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

  const handleSearchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) {
      toast.error("CEP deve ter 8 dígitos");
      return;
    }

    setIsLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      form.setValue("address", data.logradouro || "");
      form.setValue("city", data.localidade || "");
      form.setValue("state", data.uf || "");
      toast.success("CEP encontrado!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const isLoading = createClinicMutation.isPending || updateClinicMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Clínica" : "Nova Clínica"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da clínica"
              : "Preencha os dados para cadastrar uma nova clínica"}
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
                      <FormLabel>Nome da clínica</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome da clínica veterinária"
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
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading || isEditing}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="">Selecione um usuário (CLINIC)</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FieldDescription>
                        {isEditing ? "Não é possível alterar o usuário" : "Selecione um usuário com papel CLINIC"}
                      </FieldDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="00.000.000/0000-00"
                            disabled={isLoading}
                            maxLength={18}
                            onChange={(e) => {
                              const masked = maskCNPJ(e.target.value);
                              field.onChange(masked);
                            }}
                          />
                        </FormControl>
                        <FieldDescription>Opcional</FieldDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>

                <Field>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="(00) 0 0000-0000"
                            disabled={isLoading}
                            maxLength={15}
                            onChange={(e) => {
                              const masked = maskPhone(e.target.value);
                              field.onChange(masked);
                            }}
                          />
                        </FormControl>
                        <FieldDescription>Opcional</FieldDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
              </div>

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
                          placeholder="contato@clinica.com"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FieldDescription>Opcional</FieldDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <Field>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Rua, número, complemento"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FieldDescription>Opcional</FieldDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Cidade"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FieldDescription>Opcional</FieldDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>

                <Field>
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="UF"
                            maxLength={2}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FieldDescription>Opcional</FieldDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>

                <Field>
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="00000-000"
                              disabled={isLoading || isLoadingCEP}
                              maxLength={9}
                              onChange={(e) => {
                                const masked = maskCEP(e.target.value);
                                field.onChange(masked);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && field.value) {
                                  e.preventDefault();
                                  const cleanCEP = field.value.replace(/\D/g, "");
                                  if (cleanCEP.length === 8) {
                                    handleSearchCEP(field.value);
                                  }
                                }
                              }}
                            />
                            {isLoadingCEP && (
                              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FieldDescription>
                          Opcional - Digite o CEP e pressione Enter para buscar
                        </FieldDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
              </div>

              <Field>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="ATIVO">Ativo</option>
                          <option value="INATIVO">Inativo</option>
                        </select>
                      </FormControl>
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

