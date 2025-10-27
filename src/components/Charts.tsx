import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusAnalysis, ExcelData } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsProps {
  statusAnalysis: StatusAnalysis;
  data: ExcelData[];
}

export function Charts({ statusAnalysis, data }: ChartsProps) {
  // Gráfico de linha para evolução dos status
  const statusLineData = {
    labels: ['Presente', 'Faltou', 'Cancelado', 'Desmarcados'],
    datasets: [
      {
        label: 'Quantidade',
        data: [
          statusAnalysis['Atendido'] || 0,
          statusAnalysis['Falta'] || 0,
          statusAnalysis['Cancelado'] || 0,
          statusAnalysis['Terapeuta desmarcou'] || 0
        ],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#388E3C',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const statusLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Evolução dos Status de Agendamento'
      },
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Gráfico de barras para atendimentos por dia
  const dailyData = React.useMemo(() => {
    const dailyCounts: { [key: string]: number } = {};
    
    data.forEach((row) => {
      const inicioPrevisto = row['Início previsto'] || '';
      const fimPrevisto = row['Fim previsto'] || '';
      const status = row['Status'] || row['status'] || row['STATUS'] || '';
      
      // Use "Início previsto" for all statuses, fallback to "Fim previsto"
      const date = inicioPrevisto || fimPrevisto;
      
      if (date) {
        let dayKey = '';
        if (date.includes('/')) {
          // Formato DD/MM/YYYY ou DD/MM/YYYY HH:MM
          const datePart = date.split(' ')[0];
          const parts = datePart.split('/');
          if (parts.length === 3) {
            dayKey = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
          } else {
            dayKey = datePart;
          }
        } else if (date.includes('-')) {
          // Formato YYYY-MM-DD
          const datePart = date.split(' ')[0];
          const parts = datePart.split('-');
          if (parts.length === 3) {
            dayKey = `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
          } else {
            dayKey = datePart;
          }
        } else {
          dayKey = date;
        }
        
        if (dayKey && dayKey.includes('/')) {
          if (!dailyCounts[dayKey]) {
            dailyCounts[dayKey] = 0;
          }
          if (status === 'Atendido') {
            dailyCounts[dayKey]++;
          }
        }
      }
    });

    const days = Object.keys(dailyCounts).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      return yearA - yearB || monthA - monthB || dayA - dayB;
    });
    const attendanceCounts = days.map(day => dailyCounts[day]);

    return {
      labels: days.map(day => `Dia ${day}`),
      datasets: [
        {
          label: 'Atendimentos',
          data: attendanceCounts,
          backgroundColor: '#2196F3',
          borderColor: '#1976D2',
          borderWidth: 1
        }
      ]
    };
  }, [data]);

  const dailyBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Atendimentos Realizados por Dia'
      },
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>📈 Evolução dos Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={statusLineData} options={statusLineOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Atendimentos por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={dailyData} options={dailyBarOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
