"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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

import { useCreatePlan } from "@/hooks/mutations/use-create-plan";
import { useUpdatePlan } from "@/hooks/mutations/use-update-plan";

const planFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nome é obrigatório" })
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" })
    .trim(),
  description: z.string().max(500, { message: "Descrição deve ter no máximo 500 caracteres" }).trim().optional(),
  price: z
    .string()
    .min(1, { message: "Preço é obrigatório" })
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      { message: "Preço deve ser um número válido" }
    ),
  carePeriodDays: z
    .number()
    .min(0, { message: "Carência deve ser um número positivo" })
    .max(365, { message: "Carência não pode ser maior que 365 dias" }),
  status: z.enum(["ATIVO", "INATIVO"]),
});

type PlanFormData = z.infer<typeof planFormSchema>;

type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  carePeriodDays: number;
  status: "ATIVO" | "INATIVO";
};

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
  onSuccess?: () => void;
}

export function PlanFormDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: PlanFormDialogProps) {
  const isEditing = !!plan;

  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0.00",
      carePeriodDays: 30,
      status: "ATIVO",
    },
  });

  useEffect(() => {
    if (plan && open) {
      form.reset({
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        carePeriodDays: plan.carePeriodDays,
        status: plan.status,
      });
    } else if (open) {
      form.reset({
        name: "",
        description: "",
        price: "0.00",
        carePeriodDays: 30,
        status: "ATIVO",
      });
    }
  }, [plan, open, form]);

  const onSubmit = async (values: PlanFormData) => {
    if (isEditing && plan) {
      updatePlanMutation.mutate(
        {
          id: plan.id,
          name: values.name,
          description: values.description,
          price: values.price,
          carePeriodDays: values.carePeriodDays,
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
      createPlanMutation.mutate(
        {
          name: values.name,
          description: values.description,
          price: values.price,
          carePeriodDays: values.carePeriodDays,
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

  const isLoading = createPlanMutation.isPending || updatePlanMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Plano" : "Novo Plano"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do plano"
              : "Preencha os dados para cadastrar um novo plano"}
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
                      <FormLabel>Nome do plano</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Essencial, Saúde, Premium"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Descreva os benefícios e características do plano"
                          disabled={isLoading}
                          rows={4}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="0.00"
                          disabled={isLoading}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.,]/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FieldDescription>Ex: 99.90</FieldDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <Field>
                <FormField
                  control={form.control}
                  name="carePeriodDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carência (dias)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="365"
                          disabled={isLoading}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            field.onChange(value);
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FieldDescription>Período de carência em dias antes de poder usar os benefícios</FieldDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

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

