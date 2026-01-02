"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getPetByCodeAction } from "@/actions/get-pet-by-code";

const consultationFormSchema = z.object({
  petCard: z
    .string()
    .min(1, { message: "Carteirinha do PET é obrigatória" })
    .trim(),
});

type ConsultationFormData = z.infer<typeof consultationFormSchema>;

interface ConsultationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onSuccess?: () => void;
}

export function ConsultationFormDialog({
  open,
  onOpenChange,
  clinicId,
  onSuccess,
}: ConsultationFormDialogProps) {
  const router = useRouter();
  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      petCard: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values: ConsultationFormData) => {
    try {
      setIsLoading(true);

      // Buscar pet pelo código
      const result = await getPetByCodeAction({ codigo: values.petCard });

      if (result?.serverError) {
        toast.error("Erro ao validar carteirinha do PET");
        return;
      }

      if (result?.validationErrors) {
        toast.error("Código inválido");
        return;
      }

      if (result?.data?.error) {
        toast.error("PET Não Autorizado");
        return;
      }

      const pet = result?.data?.pet;

      if (!pet) {
        toast.error("PET Não Autorizado");
        return;
      }

      // Verificar status do pet
      if (pet.status === "ATIVO") {
        toast.success("Pet Autorizado");
        onOpenChange(false);
        form.reset();
        // Redirecionar para a página de informações do pet
        router.push(`/consultas/${values.petCard}`);
        onSuccess?.();
      } else {
        toast.error("PET Não Autorizado");
      }
    } catch (error) {
      console.error("Erro ao validar pet:", error);
      toast.error("Erro ao validar carteirinha do PET");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Consulta</DialogTitle>
          <DialogDescription>
            Digite a carteirinha do PET para iniciar uma nova consulta
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FormField
                  control={form.control}
                  name="petCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carteirinha do PET</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite a carteirinha do PET"
                          disabled={isLoading}
                        />
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
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

