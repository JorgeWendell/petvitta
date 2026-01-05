"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedicalRecords } from "@/hooks/queries/use-medical-records";
import { MedicalRecordViewDialog } from "./medical-record-view-dialog";

interface MedicalRecordsHistoryProps {
  petId: string;
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

export function MedicalRecordsHistory({ petId }: MedicalRecordsHistoryProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const { data, isLoading, error } = useMedicalRecords(petId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Prontuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Prontuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Erro ao carregar histórico: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const medicalRecords = data?.medicalRecords || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Prontuários</CardTitle>
        </CardHeader>
        <CardContent>
          {medicalRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum prontuário encontrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clínica</TableHead>
                  <TableHead>Veterinário</TableHead>
                  <TableHead>Data da Consulta</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.clinicName || "-"}
                    </TableCell>
                    <TableCell>{record.doctorName || "-"}</TableCell>
                    <TableCell>
                      {formatDate(record.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecordId(record.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver mais
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedRecordId && (
        <MedicalRecordViewDialog
          open={!!selectedRecordId}
          onOpenChange={(open) => !open && setSelectedRecordId(null)}
          medicalRecordId={selectedRecordId}
        />
      )}
    </>
  );
}

