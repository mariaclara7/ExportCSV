import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PatientStats } from '@/types';
import { formatDate } from '@/lib/utils';
import { Users, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface AwardsTableProps {
  patientStats: PatientStats[];
}

export function AwardsTable({ patientStats }: AwardsTableProps) {
  const [sortBy, setSortBy] = useState<'attendance' | 'attendance-low'>('attendance');
  const [nameSort, setNameSort] = useState<'asc' | 'desc' | null>(null);
  const [percentageFilter, setPercentageFilter] = useState<'all' | '100' | '100-90' | '90-80' | 'below-80'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtrar pacientes que têm pelo menos uma sessão atendida
  const eligiblePatients = patientStats.filter(patient => patient.hasAtLeastOneAttended);

  // Calcular porcentagem de presença para cada paciente
  const patientsWithAttendance = eligiblePatients.map(patient => {
    // Taxa de presença = (Atendidas / (Atendidas + Faltas)) * 100
    // Cancelados e Desmarcados não contam como falta
    const totalRelevantAppointments = patient.atendidoCount + patient.absences;
    const attendanceRate = totalRelevantAppointments > 0 ? 
      (patient.atendidoCount / totalRelevantAppointments * 100) : 0;
    
    return {
      ...patient,
      attendanceRate
    };
  });

  // Filtrar por faixa de porcentagem
  const filteredPatients = patientsWithAttendance.filter(patient => {
    if (percentageFilter === 'all') return true;
    if (percentageFilter === '100') return patient.attendanceRate === 100;
    if (percentageFilter === '100-90') return patient.attendanceRate >= 90 && patient.attendanceRate < 100;
    if (percentageFilter === '90-80') return patient.attendanceRate >= 80 && patient.attendanceRate < 90;
    if (percentageFilter === 'below-80') return patient.attendanceRate < 80;
    return true;
  });

  // Ordenar baseado no filtro selecionado
  const sortedPatients = filteredPatients.sort((a, b) => {
    // Se há ordenação alfabética ativa, ela tem prioridade
    if (nameSort === 'asc') {
      return a.name.localeCompare(b.name); // A-Z
    } else if (nameSort === 'desc') {
      return b.name.localeCompare(a.name); // Z-A
    }
    
    // Caso contrário, usar ordenação por taxa
    if (sortBy === 'attendance') {
      return b.attendanceRate - a.attendanceRate; // Maior taxa primeiro
    } else if (sortBy === 'attendance-low') {
      return a.attendanceRate - b.attendanceRate; // Menor taxa primeiro
    }
    
    return 0;
  });

  // Calcular paginação
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = sortedPatients.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  const handleFilterChange = (newFilter: 'all' | '100' | '100-90' | '90-80' | 'below-80') => {
    setPercentageFilter(newFilter);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Análise de Pacientes
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: 'attendance' | 'attendance-low') => {
                setSortBy(value);
                setNameSort(null); // Limpar ordenação alfabética quando usar dropdown
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Maior Taxa</SelectItem>
                  <SelectItem value="attendance-low">Menor Taxa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtrar:</span>
              <Select value={percentageFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Faixa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                  <SelectItem value="100-90">90-99%</SelectItem>
                  <SelectItem value="90-80">80-89%</SelectItem>
                  <SelectItem value="below-80">Abaixo 80%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Por página:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {sortedPatients.length === 0 
              ? "Nenhum paciente encontrado para esta faixa"
              : `Mostrando ${startIndex + 1}-${Math.min(endIndex, sortedPatients.length)} de ${sortedPatients.length} pacientes - ${percentageFilter === 'all' ? 'Todas as faixas' : 
                  percentageFilter === '100' ? '100%' :
                  percentageFilter === '100-90' ? '90-99%' : 
                  percentageFilter === '90-80' ? '80-89%' : 'Abaixo de 80%'} - Ordenado por ${
                    nameSort === 'asc' ? 'nome A-Z' :
                    nameSort === 'desc' ? 'nome Z-A' :
                    sortBy === 'attendance' ? 'maior taxa' : 
                    sortBy === 'attendance-low' ? 'menor taxa' :
                    'maior taxa'
                  }`
            }
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                onClick={() => {
                  if (nameSort === 'asc') {
                    setNameSort('desc');
                  } else {
                    setNameSort('asc');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  Nome do Paciente
                  {nameSort === 'asc' ? (
                    <ArrowUp className="h-4 w-4 text-blue-600" />
                  ) : nameSort === 'desc' ? (
                    <ArrowDown className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Atendidas</TableHead>
              <TableHead className="text-center">Canceladas</TableHead>
              <TableHead className="text-center">Desmarcadas</TableHead>
              <TableHead className="text-center">Faltas</TableHead>
              <TableHead className="text-center">Taxa de Presença</TableHead>
              <TableHead className="text-right">Último Agendamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <span>Nenhum paciente encontrado para esta faixa</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPatients.map((patient, index) => {
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
                      <Badge variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-sm">
                        {patient.absences}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${
                        patient.attendanceRate >= 90 ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' :
                        patient.attendanceRate >= 80 ? 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100' :
                        'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                      }`}>
                        {patient.attendanceRate.toFixed(1)}%
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
        
        {/* Controles de Paginação */}
        {sortedPatients.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
