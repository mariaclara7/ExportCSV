import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PatientStats } from '@/types';
import { formatDate } from '@/lib/utils';
import { Users } from 'lucide-react';

interface AwardsTableProps {
  patientStats: PatientStats[];
}

export function AwardsTable({ patientStats }: AwardsTableProps) {
  // Filtrar pacientes que têm pelo menos uma sessão atendida
  // e mostrar todos os pacientes (não apenas os com 100% de presença)
  const eligiblePatients = patientStats
    .filter(patient => patient.hasAtLeastOneAttended)
    .sort((a, b) => b.totalAppointments - a.totalAppointments);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Pacientes sem faltas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {eligiblePatients.length === 0 
              ? "Nenhum paciente elegível encontrado"
              : `Total de ${eligiblePatients.length} pacientes elegíveis`
            }
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Paciente</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Atendidas</TableHead>
              <TableHead className="text-center">Canceladas</TableHead>
              <TableHead className="text-center">Desmarcadas</TableHead>
              <TableHead className="text-center">Taxa</TableHead>
              <TableHead className="text-right">Último Agendamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eligiblePatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <span>Nenhum paciente elegível encontrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              eligiblePatients.map((patient, index) => {
                const attendanceRate = patient.totalAppointments > 0 ? 
                  (patient.atendidoCount / patient.totalAppointments * 100) : 0;
                
                return (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {patient.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {patient.totalAppointments}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
                        {patient.atendidoCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm">
                        {patient.canceladoCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500 shadow-sm">
                        {patient.desmarcadoCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100">
                        {attendanceRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(patient.lastAppointment)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
