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

import { useCreateSubscription } from "@/hooks/mutations/use-create-subscription";
import { useUpdateSubscription } from "@/hooks/mutations/use-update-subscription";
import { usePets } from "@/hooks/queries/use-pets";
import { usePlans } from "@/hooks/queries/use-plans";

const subscriptionFormSchema = z.object({
  petId: z.string().min(1, { message: "Pet é obrigatório" }),
  planId: z.string().min(1, { message: "Plano é obrigatório" }),
  status: z.enum(["ATIVA", "CANCELADA", "SUSPENSA", "EXPIRADA"]).default("ATIVA"),
  startDate: z.string().min(1, { message: "Data de início é obrigatória" }),
  endDate: z.string().optional(),
  nextBillingDate: z.string().optional(),
  asaasSubscriptionId: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

type Subscription = {
  id: string;
  petId: string;
  planId: string;
  status: "ATIVA" | "CANCELADA" | "SUSPENSA" | "EXPIRADA";
  startDate: Date;
  endDate?: Date | null;
  nextBillingDate?: Date | null;
  asaasSubscriptionId?: string | null;
};

interface SubscriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  onSuccess?: () => void;
}

export function SubscriptionFormDialog({
  open,
  onOpenChange,
  subscription,
  onSuccess,
}: SubscriptionFormDialogProps) {
  const isEditing = !!subscription;

  const createSubscriptionMutation = useCreateSubscription();
  const updateSubscriptionMutation = useUpdateSubscription();

  // Buscar pets e planos para os selects
  const { data: petsData } = usePets({ limit: 100 });
  const pets = petsData?.pets || [];

  const { data: plansData } = usePlans({ limit: 100 });
  const plans = plansData?.plans || [];

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      petId: "",
      planId: "",
      status: "ATIVA",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      nextBillingDate: "",
      asaasSubscriptionId: "",
    },
  });

  useEffect(() => {
    if (subscription && open) {
      form.reset({
        petId: subscription.petId,
        planId: subscription.planId,
        status: subscription.status,
        startDate: subscription.startDate
          ? new Date(subscription.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: subscription.endDate
          ? new Date(subscription.endDate).toISOString().split("T")[0]
          : "",
        nextBillingDate: subscription.nextBillingDate
          ? new Date(subscription.nextBillingDate).toISOString().split("T")[0]
          : "",
        asaasSubscriptionId: subscription.asaasSubscriptionId || "",
      });
    } else if (open) {
      form.reset({
        petId: "",
        planId: "",
        status: "ATIVA",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        nextBillingDate: "",
        asaasSubscriptionId: "",
      });
    }
  }, [subscription, open, form]);

  const onSubmit = async (values: SubscriptionFormData) => {
    if (isEditing && subscription) {
      updateSubscriptionMutation.mutate(
        {
          id: subscription.id,
          petId: values.petId,
          planId: values.planId,
          status: values.status,
          startDate: values.startDate,
          endDate: values.endDate,
          nextBillingDate: values.nextBillingDate,
          asaasSubscriptionId: values.asaasSubscriptionId,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    } else {
      createSubscriptionMutation.mutate(
        {
          petId: values.petId,
          planId: values.planId,
          status: values.status,
          startDate: values.startDate,
          endDate: values.endDate,
          nextBillingDate: values.nextBillingDate,
          asaasSubscriptionId: values.asaasSubscriptionId,
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
    createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Assinatura" : "Nova Assinatura"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da assinatura"
              : "Preencha os dados para cadastrar uma nova assinatura"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FormField
                  control={form.control}
                  name="petId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="">Selecione um pet</option>
                          {pets.map((pet) => (
                            <option key={pet.id} value={pet.id}>
                              {pet.name}
                            </option>
                          ))}
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
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="">Selecione um plano</option>
                          {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de início</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
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
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de término</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            disabled={isLoading}
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
                  name="nextBillingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próxima cobrança</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
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
                  name="asaasSubscriptionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Assinatura Asaas</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ID da assinatura no Asaas"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FieldDescription>Opcional - ID da assinatura no gateway de pagamento</FieldDescription>
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
                          <option value="ATIVA">Ativa</option>
                          <option value="CANCELADA">Cancelada</option>
                          <option value="SUSPENSA">Suspensa</option>
                          <option value="EXPIRADA">Expirada</option>
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

