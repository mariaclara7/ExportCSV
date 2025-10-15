import { useState, useCallback } from 'react';
import { ExcelData, StatusAnalysis, PatientStats, DashboardStats } from '@/types';
import { 
  processExcelFile, 
  analyzeStatus, 
  calculatePatientStats, 
  calculateDashboardStats 
} from '@/lib/excelProcessor';

export function useExcelDashboard() {
  const [data, setData] = useState<ExcelData[]>([]);
  const [statusAnalysis, setStatusAnalysis] = useState<StatusAnalysis>({});
  const [patientStats, setPatientStats] = useState<PatientStats[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalAbsences: 0,
    overallAttendanceRate: 0,
    totalPatients: 0,
    perfectAttendance: 0,
    attendanceRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Por favor, selecione um arquivo válido (.xlsx, .xls ou .csv)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const processedData = await processExcelFile(file);
      setData(processedData);

      // Encontrar coluna de status
      const statusColumn = Object.keys(processedData[0]).find(key => 
        key.toLowerCase().includes('status') || 
        key.toLowerCase().includes('situação') ||
        key.toLowerCase().includes('situacao') ||
        key.toLowerCase().includes('estado')
      );

      if (!statusColumn) {
        throw new Error('Não foi possível encontrar uma coluna de status');
      }

      // Analisar status
      const analysis = analyzeStatus(processedData, statusColumn);
      setStatusAnalysis(analysis);

      // Calcular estatísticas dos pacientes
      const patients = calculatePatientStats(processedData);
      setPatientStats(patients);

      // Calcular estatísticas do dashboard
      const stats = calculateDashboardStats(processedData, analysis, patients);
      setDashboardStats(stats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetDashboard = useCallback(() => {
    setData([]);
    setStatusAnalysis({});
    setPatientStats([]);
    setDashboardStats({
      totalAppointments: 0,
      totalAbsences: 0,
      overallAttendanceRate: 0,
      totalPatients: 0,
      perfectAttendance: 0,
      attendanceRate: 0
    });
    setError(null);
  }, []);

  return {
    data,
    statusAnalysis,
    patientStats,
    dashboardStats,
    isLoading,
    error,
    processFile,
    resetDashboard
  };
}
