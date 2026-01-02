"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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

import { useCreatePet } from "@/hooks/mutations/use-create-pet";
import { useUpdatePet } from "@/hooks/mutations/use-update-pet";
import { useUsers } from "@/hooks/queries/use-users";

const petFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nome é obrigatório" })
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" })
    .trim(),
  species: z.enum(["CÃO", "GATO", "PASSARO", "COELHO", "HAMSTER", "OUTRO"], {
    required_error: "Espécie é obrigatória",
  }),
  breed: z.string().max(100, { message: "Raça deve ter no máximo 100 caracteres" }).trim().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MACHO", "FÊMEA"]).optional(),
  status: z.enum(["ATIVO", "SUSPENSO"]).default("ATIVO"),
  tutorId: z.string().min(1, { message: "Tutor é obrigatório" }),
  planId: z.string().optional(),
});

type PetFormData = z.infer<typeof petFormSchema>;

type Pet = {
  id: string;
  name: string;
  species: "CÃO" | "GATO" | "PASSARO" | "COELHO" | "HAMSTER" | "OUTRO";
  breed?: string | null;
  dateOfBirth?: Date | null;
  gender?: "MACHO" | "FÊMEA" | null;
  status: "ATIVO" | "SUSPENSO";
  tutorId: string;
  planId?: string | null;
};

interface PetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet?: Pet | null;
  onSuccess?: () => void;
}

export function PetFormDialog({
  open,
  onOpenChange,
  pet,
  onSuccess,
}: PetFormDialogProps) {
  const isEditing = !!pet;

  const createPetMutation = useCreatePet();
  const updatePetMutation = useUpdatePet();

  // Buscar tutores para o select
  const { data: tutorsData } = useUsers({ role: "TUTOR", limit: 100 });
  const tutors = tutorsData?.users || [];

  const form = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      species: "CÃO",
      breed: "",
      dateOfBirth: "",
      gender: undefined,
      status: "ATIVO",
      tutorId: "",
      planId: "",
    },
  });

  useEffect(() => {
    if (pet && open) {
      form.reset({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || "",
        dateOfBirth: pet.dateOfBirth
          ? new Date(pet.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: pet.gender || undefined,
        status: pet.status,
        tutorId: pet.tutorId,
        planId: pet.planId || "",
      });
    } else if (open) {
      form.reset({
        name: "",
        species: "CÃO",
        breed: "",
        dateOfBirth: "",
        gender: undefined,
        status: "ATIVO",
        tutorId: "",
        planId: "",
      });
    }
  }, [pet, open, form]);

  const onSubmit = async (values: PetFormData) => {
    if (isEditing && pet) {
      updatePetMutation.mutate(
        {
          id: pet.id,
          name: values.name,
          species: values.species,
          breed: values.breed,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          status: values.status,
          tutorId: values.tutorId,
          planId: values.planId,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    } else {
      createPetMutation.mutate(
        {
          name: values.name,
          species: values.species,
          breed: values.breed,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          status: values.status,
          tutorId: values.tutorId,
          planId: values.planId,
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

  const isLoading = createPetMutation.isPending || updatePetMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Pet" : "Novo Pet"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do pet"
              : "Preencha os dados para cadastrar um novo pet"}
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
                      <FormLabel>Nome do pet</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome do pet"
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
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espécie</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="CÃO">Cão</option>
                          <option value="GATO">Gato</option>
                          <option value="PASSARO">Pássaro</option>
                          <option value="COELHO">Coelho</option>
                          <option value="HAMSTER">Hamster</option>
                          <option value="OUTRO">Outro</option>
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
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raça</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Golden Retriever, Persa..."
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
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de nascimento</FormLabel>
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
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="">Selecione...</option>
                          <option value="MACHO">Macho</option>
                          <option value="FÊMEA">Fêmea</option>
                        </select>
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
                  name="tutorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tutor</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="">Selecione um tutor</option>
                          {tutors.map((tutor) => (
                            <option key={tutor.id} value={tutor.id}>
                              {tutor.name} ({tutor.email})
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
                          <option value="SUSPENSO">Suspenso</option>
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

