import { Button } from '@/components/ui/button';
import { StatsCards } from './StatsCards';
import { ModernDashboard } from './ModernDashboard';
import { AwardsTable } from './AwardsTable';
import { DashboardStats, StatusAnalysis, PatientStats } from '@/types';
import { RotateCcw } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
  statusAnalysis: StatusAnalysis;
  patientStats: PatientStats[];
  data: any[];
  onReset: () => void;
}

export function Dashboard({ 
  stats, 
  statusAnalysis, 
  patientStats, 
  data, 
  onReset 
}: DashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">📈 Análise dos Dados</h2>
        <Button 
          onClick={onReset}
          variant="destructive"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Nova Análise</span>
        </Button>
      </div>

      <ModernDashboard statusAnalysis={statusAnalysis} data={data} />

      <AwardsTable patientStats={patientStats} />
    </div>
  );
}
