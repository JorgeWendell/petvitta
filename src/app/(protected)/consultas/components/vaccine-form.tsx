"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Field, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { createPetVaccineAction } from "@/actions/create-pet-vaccine";

const vaccineSchema = z.object({
  vaccineName: z.string().min(1, "Nome da vacina é obrigatório"),
  dose: z.string().min(1, "Dose é obrigatória"),
  vaccineDate: z.string().min(1, "Data é obrigatória"),
  nextDoseDate: z.string().optional(),
});

const vaccinesFormSchema = z.object({
  vaccines: z.array(vaccineSchema).default([]),
});

type VaccinesFormData = z.infer<typeof vaccinesFormSchema>;

interface VaccineFormProps {
  petId: string;
}

export function VaccineForm({ petId }: VaccineFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VaccinesFormData>({
    resolver: zodResolver(vaccinesFormSchema),
    defaultValues: {
      vaccines: [],
    },
  });

  const {
    fields: vaccineFields,
    append: appendVaccine,
    remove: removeVaccine,
  } = useFieldArray({
    control: form.control,
    name: "vaccines",
  });

  const onSubmit = async (data: VaccinesFormData) => {
    try {
      setIsLoading(true);

      // Salvar cada vacina individualmente
      for (const vaccine of data.vaccines) {
        const result = await createPetVaccineAction({
          petId,
          vaccineName: vaccine.vaccineName,
          dose: vaccine.dose,
          vaccineDate: vaccine.vaccineDate,
          nextDoseDate: vaccine.nextDoseDate,
        });

        if (result?.serverError) {
          toast.error(result.serverError);
          return;
        }

        if (result?.validationErrors) {
          toast.error("Erro de validação");
          return;
        }

        if (result.data?.error) {
          toast.error(result.data.error);
          return;
        }
      }

      toast.success("Vacinas salvas com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar vacinas:", error);
      toast.error("Erro ao salvar vacinas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vacinas</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendVaccine({
                    vaccineName: "",
                    dose: "",
                    vaccineDate: "",
                    nextDoseDate: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vaccineFields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma vacina adicionada
                </p>
              ) : (
                vaccineFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Vacina {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVaccine(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`vaccines.${index}.vaccineName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nome da vacina"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`vaccines.${index}.dose`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dose</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ex: 1ª dose"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`vaccines.${index}.vaccineDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data</FormLabel>
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
                        <FormField
                          control={form.control}
                          name={`vaccines.${index}.nextDoseDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Próxima Dose (data)</FormLabel>
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
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Vacinas
          </Button>
        </div>
      </form>
    </Form>
  );
}

