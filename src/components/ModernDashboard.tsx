import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart';
import { StatusAnalysis, ExcelData } from '@/types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';
import { CheckCircle, XCircle, TrendingDown, Calendar } from 'lucide-react';

interface ModernDashboardProps {
  statusAnalysis: StatusAnalysis;
  data: ExcelData[];
}


export function ModernDashboard({ statusAnalysis, data }: ModernDashboardProps) {
  const totalAppointments = Object.values(statusAnalysis).reduce((sum, count) => sum + count, 0);
  const attendanceRate = totalAppointments > 0 ? ((statusAnalysis['Atendido'] || 0) / totalAppointments) * 100 : 0;

  // Configuração dos charts do shadcn/ui - tons de azul
  const chartConfig = {
    atendidos: {
      label: "Atendidos",
      color: "hsl(221, 83%, 53%)", // Azul mais escuro
    },
    faltas: {
      label: "Faltas", 
      color: "hsl(221, 83%, 63%)", // Azul médio
    },
    cancelados: {
      label: "Cancelados",
      color: "hsl(221, 83%, 73%)", // Azul claro
    },
    desmarcados: {
      label: "Desmarcados",
      color: "hsl(221, 83%, 83%)", // Azul muito claro
    },
  } satisfies ChartConfig;

  // Dados para gráfico de barras empilhadas por dia
  const dailyStackedData = React.useMemo(() => {
    const dailyCounts: { [key: string]: { atendidos: number; faltas: number; cancelados: number; desmarcados: number } } = {};
    
    // Processar dados para agrupar por dia
    data.forEach((row) => {
      const status = row['Status'] || row['status'] || row['STATUS'] || '';
      const inicioReal = row['Início real'] || '';
      const inicioPrevisto = row['Início previsto'] || '';
      
      if (status) {
        try {
          let date: Date | undefined;
          
          // Normalize status for comparison
          const normalizedStatus = status.toLowerCase().trim();
          
          // Choose the correct date column based on status
          if (normalizedStatus === 'atendido' && inicioReal) {
            // For "Atendido" status, use "Início real"
            if (inicioReal.includes('/')) {
              const datePart = inicioReal.split(' ')[0];
              const parts = datePart.split('/');
              if (parts.length === 3) {
                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              } else {
                date = new Date(inicioReal);
              }
            } else if (inicioReal.includes('-')) {
              const datePart = inicioReal.split(' ')[0];
              date = new Date(datePart);
            } else {
              date = new Date(inicioReal);
            }
          } else if ((normalizedStatus === 'falta' || normalizedStatus === 'cancelado' || normalizedStatus === 'terapeuta desmarcou' || normalizedStatus === 'desmarcado') && inicioPrevisto) {
            // For other statuses, use "Início previsto"
            if (inicioPrevisto.includes('/')) {
              const datePart = inicioPrevisto.split(' ')[0];
              const parts = datePart.split('/');
              if (parts.length === 3) {
                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              } else {
                date = new Date(inicioPrevisto);
              }
            } else if (inicioPrevisto.includes('-')) {
              const datePart = inicioPrevisto.split(' ')[0];
              date = new Date(datePart);
            } else {
              date = new Date(inicioPrevisto);
            }
          }
          
          if (date && !isNaN(date.getTime())) {
            const dayKey = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!dailyCounts[dayKey]) {
              dailyCounts[dayKey] = { atendidos: 0, faltas: 0, cancelados: 0, desmarcados: 0 };
            }
            
            if (normalizedStatus === 'atendido') {
              dailyCounts[dayKey].atendidos++;
            } else if (normalizedStatus === 'falta') {
              dailyCounts[dayKey].faltas++;
            } else if (normalizedStatus === 'cancelado') {
              dailyCounts[dayKey].cancelados++;
            } else if (normalizedStatus === 'terapeuta desmarcou' || normalizedStatus === 'desmarcado') {
              dailyCounts[dayKey].desmarcados++;
            }
          }
        } catch (error) {
          console.warn('Error processing date:', { inicioReal, inicioPrevisto, status }, error);
        }
      }
    });

    return Object.entries(dailyCounts)
      .sort(([a], [b]) => {
        const [dayA, monthA] = a.split('/').map(Number);
        const [dayB, monthB] = b.split('/').map(Number);
        return monthA - monthB || dayA - dayB;
      })
      .map(([day, counts]) => ({
        day,
        atendidos: counts.atendidos,
        faltas: counts.faltas,
        cancelados: counts.cancelados,
        desmarcados: counts.desmarcados,
        total: counts.atendidos + counts.faltas + counts.cancelados + counts.desmarcados
      }));
  }, [data]);


  return (
    <div className="space-y-6">
      {/* Cards de Status Detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presenças</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{attendanceRate.toFixed(1)}%</div>
            <div className="mt-2">
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300" 
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusAnalysis['Atendido'] || 0} atendimentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faltas</CardTitle>
            <XCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{((statusAnalysis['Falta'] || 0) / totalAppointments * 100).toFixed(1)}%</div>
            <div className="mt-2">
              <div className="h-2 bg-rose-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-600 rounded-full transition-all duration-300" 
                  style={{ width: `${(statusAnalysis['Falta'] || 0) / totalAppointments * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusAnalysis['Falta'] || 0} faltas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{((statusAnalysis['Cancelado'] || 0) / totalAppointments * 100).toFixed(1)}%</div>
            <div className="mt-2">
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600 rounded-full transition-all duration-300" 
                  style={{ width: `${(statusAnalysis['Cancelado'] || 0) / totalAppointments * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusAnalysis['Cancelado'] || 0} cancelamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remarcações</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{((statusAnalysis['Terapeuta desmarcou'] || 0) / totalAppointments * 100).toFixed(1)}%</div>
            <div className="mt-2">
              <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                  style={{ width: `${(statusAnalysis['Terapeuta desmarcou'] || 0) / totalAppointments * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusAnalysis['Terapeuta desmarcou'] || 0} remarcações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-4xl font-bold text-slate-800 mb-2">{totalAppointments}</div>
            <div className="flex items-center justify-center gap-1 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras Empilhadas por Dia */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos por Dia</CardTitle>
          <CardDescription>
            Quantidade de agendamentos por status em cada dia (barras empilhadas)
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStackedData} width={undefined} height={400}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="atendidos" stackId="status" fill="var(--color-atendidos)" name="Atendidos" />
                <Bar dataKey="faltas" stackId="status" fill="var(--color-faltas)" name="Faltas" />
                <Bar dataKey="cancelados" stackId="status" fill="var(--color-cancelados)" name="Cancelados" />
                <Bar dataKey="desmarcados" stackId="status" fill="var(--color-desmarcados)" name="Desmarcados" />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  );
}
