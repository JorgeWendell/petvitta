"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicalRecordForm } from "./medical-record-form";

interface MedicalRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  petName: string;
  clinicId: string;
}

export function MedicalRecordDialog({
  open,
  onOpenChange,
  petId,
  petName,
  clinicId,
}: MedicalRecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário Médico - {petName}
          </DialogTitle>
          <DialogDescription>
            Registre e visualize as informações médicas do pet
          </DialogDescription>
        </DialogHeader>

        <MedicalRecordForm petId={petId} clinicId={clinicId} />
      </DialogContent>
    </Dialog>
  );
}

