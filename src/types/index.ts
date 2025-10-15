export interface ExcelData {
  [key: string]: string;
}

export interface StatusAnalysis {
  [status: string]: number;
}

export interface PatientStats {
  name: string;
  totalAppointments: number;
  attendances: number;
  absences: number;
  cancellations: number;
  lastAppointment: string;
  statuses: string[];
  // Novos campos para contagem específica de status
  atendidoCount: number;
  canceladoCount: number;
  desmarcadoCount: number;
  hasAtLeastOneAttended: boolean; // Indica se o paciente tem pelo menos uma sessão atendida
}

export interface DashboardStats {
  totalAppointments: number;
  totalAbsences: number;
  overallAttendanceRate: number;
  totalPatients: number;
  perfectAttendance: number;
  attendanceRate: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export interface DashboardProps {
  data: ExcelData[];
  stats: DashboardStats;
  statusAnalysis: StatusAnalysis;
  patientStats: PatientStats[];
}
