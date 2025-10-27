import React, { useState, useEffect } from 'react';
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

// Hook para animar números e barras de progresso sincronizados
function useAnimatedValue(targetValue: number, duration: number = 2000) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Função de easing (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const newValue = startValue + (targetValue - startValue) * easeOut;
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return currentValue;
}

interface ModernDashboardProps {
  statusAnalysis: StatusAnalysis;
  data: ExcelData[];
}


export function ModernDashboard({ statusAnalysis, data }: ModernDashboardProps) {
  const totalAppointments = Object.values(statusAnalysis).reduce((sum, count) => sum + count, 0);
  const attendanceRate = totalAppointments > 0 ? ((statusAnalysis['Atendido'] || 0) / totalAppointments) * 100 : 0;
  
  // Valores animados
  const animatedAttendanceRate = useAnimatedValue(attendanceRate, 2000);
  const animatedAbsenceRate = useAnimatedValue(totalAppointments > 0 ? ((statusAnalysis['Falta'] || 0) / totalAppointments * 100) : 0, 2000);
  const animatedCancellationRate = useAnimatedValue(totalAppointments > 0 ? ((statusAnalysis['Cancelado'] || 0) / totalAppointments * 100) : 0, 2000);
  const animatedRescheduleRate = useAnimatedValue(totalAppointments > 0 ? ((statusAnalysis['Terapeuta desmarcou'] || 0) / totalAppointments * 100) : 0, 2000);
  const animatedTotalAppointments = useAnimatedValue(totalAppointments, 2000);

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
      const inicioPrevisto = row['Início previsto'] || '';
      const fimPrevisto = row['Fim previsto'] || '';
      
      if (status) {
        try {
          let date: Date | undefined;
          
          // Normalize status for comparison
          const normalizedStatus = status.toLowerCase().trim();
          
          // Use "Início previsto" for all statuses, fallback to "Fim previsto"
          const dateString = inicioPrevisto || fimPrevisto;
          
          if (dateString) {
            if (dateString.includes('/')) {
              const datePart = dateString.split(' ')[0];
              const parts = datePart.split('/');
              if (parts.length === 3) {
                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              } else {
                date = new Date(dateString);
              }
            } else if (dateString.includes('-')) {
              const datePart = dateString.split(' ')[0];
              date = new Date(datePart);
            } else {
              date = new Date(dateString);
            }
          }
          
          if (date && !isNaN(date.getTime())) {
            // Usar UTC para evitar problemas de timezone
            const dayKey = `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
            
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
          console.warn('Error processing date:', { inicioPrevisto, fimPrevisto, status }, error);
        }
      }
    });

    return Object.entries(dailyCounts)
      .sort(([a], [b]) => {
        const [dayA, monthA, yearA] = a.split('/').map(Number);
        const [dayB, monthB, yearB] = b.split('/').map(Number);
        return yearA - yearB || monthA - monthB || dayA - dayB;
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
        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presenças</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{animatedAttendanceRate.toFixed(1)}%</div>
            <div className="mt-2">
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full" 
                  style={{ width: `${animatedAttendanceRate}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusAnalysis['Atendido'] || 0} atendimentos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faltas</CardTitle>
            <XCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{animatedAbsenceRate.toFixed(1)}%</div>
            <div className="mt-2">
              <div className="h-2 bg-rose-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-600 rounded-full" 
                  style={{ width: `${animatedAbsenceRate}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusAnalysis['Falta'] || 0} faltas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{animatedCancellationRate.toFixed(1)}%</div>
            <div className="mt-2">
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600 rounded-full" 
                  style={{ width: `${animatedCancellationRate}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusAnalysis['Cancelado'] || 0} cancelamentos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remarcações</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{animatedRescheduleRate.toFixed(1)}%</div>
            <div className="mt-2">
              <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${animatedRescheduleRate}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusAnalysis['Terapeuta desmarcou'] || 0} remarcações
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-4xl font-bold text-slate-800 mb-2">{Math.round(animatedTotalAppointments)}</div>
            <div className="flex items-center justify-center gap-1 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras Empilhadas por Dia */}
      <Card className="hover:shadow-lg transition-all duration-300">
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
