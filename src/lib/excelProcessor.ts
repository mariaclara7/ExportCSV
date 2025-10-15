import * as XLSX from 'xlsx';
import { ExcelData, StatusAnalysis, PatientStats, DashboardStats } from '@/types';

export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n');
  const result: string[][] = [];
  
  for (let line of lines) {
    if (line.trim()) {
      // Dividir por ponto e vírgula, mas considerar aspas
      const row: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Adicionar o último campo
      row.push(current.trim());
      result.push(row);
    }
  }
  
  return result;
}

export function processExcelFile(file: File): Promise<ExcelData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        let jsonData: string[][];
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Processar arquivo CSV
          const csvText = e.target?.result as string;
          jsonData = parseCSV(csvText);
        } else {
          // Processar arquivo Excel
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Pegar a primeira planilha
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Converter para JSON
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        }
        
        if (jsonData.length === 0) {
          reject(new Error('O arquivo está vazio ou não contém dados válidos.'));
          return;
        }
        
        // Assumir que a primeira linha são os cabeçalhos
        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);
        
        // Encontrar coluna de status
        const statusColumnIndex = findStatusColumn(headers);
        
        if (statusColumnIndex === -1) {
          reject(new Error('Não foi possível encontrar uma coluna de status. Certifique-se de que existe uma coluna com "status", "situação", "estado" ou similar.'));
          return;
        }
        
        // Processar dados
        const processedData = dataRows.map((row) => {
          const rowData: ExcelData = {};
          headers.forEach((header, colIndex) => {
            rowData[header] = (row[colIndex] || '').toString().trim();
          });
          return rowData;
        }).filter(row => {
          const statusValue = row[headers[statusColumnIndex]];
          return statusValue && statusValue !== '' && statusValue !== '""';
        });
        
        resolve(processedData);
        
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        reject(new Error('Erro ao processar o arquivo. Verifique se o arquivo não está corrompido.'));
      }
    };
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

function findStatusColumn(headers: string[]): number {
  const statusKeywords = ['status', 'situação', 'situacao', 'estado', 'state', 'condição', 'condicao'];
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toString().toLowerCase().trim();
    if (statusKeywords.some(keyword => header.includes(keyword))) {
      return i;
    }
  }
  
  // Se não encontrar, tentar posição específica para agendamentos (índice 10)
  if (headers.length > 10) {
    return 10;
  }
  
  return -1;
}

export function analyzeStatus(data: ExcelData[], statusColumn: string): StatusAnalysis {
  const statusAnalysis: StatusAnalysis = {};
  
  data.forEach(row => {
    const status = (row[statusColumn] || '').toString().trim();
    const cleanStatus = status || 'Não definido';
    statusAnalysis[cleanStatus] = (statusAnalysis[cleanStatus] || 0) + 1;
  });
  
  return statusAnalysis;
}

export function calculatePatientStats(data: ExcelData[]): PatientStats[] {
  const patientStatsMap = new Map<string, PatientStats>();
  
  data.forEach(row => {
    const patientName = row['Paciente'] || row['Nome do Paciente'] || 'Paciente não identificado';
    const status = (row['Status'] || '').toString().trim();
    const appointmentDate = row['Início previsto'] || row['Data'] || '';
    
    if (!patientStatsMap.has(patientName)) {
      patientStatsMap.set(patientName, {
        name: patientName,
        totalAppointments: 0,
        attendances: 0,
        absences: 0,
        cancellations: 0,
        lastAppointment: '',
        statuses: [],
        atendidoCount: 0,
        canceladoCount: 0,
        desmarcadoCount: 0,
        hasAtLeastOneAttended: false
      });
    }
    
    const patient = patientStatsMap.get(patientName)!;
    
    // Verificar se o status é válido para contagem (não incluir Confirmado, Confirmação pendente, Falta)
    const lowerStatus = status.toLowerCase();
    const isValidStatus = lowerStatus.includes('atendido') || 
                        lowerStatus.includes('cancelado') || 
                        lowerStatus.includes('terapeuta desmarcou') ||
                        lowerStatus.includes('desmarcado');
    
    // Só contar no total se for um status válido
    if (isValidStatus) {
      patient.totalAppointments++;
    }
    
    patient.statuses.push(status);
    
    if (appointmentDate) {
      patient.lastAppointment = appointmentDate;
    }
    
    // Contar status específicos
    if (status.toLowerCase().includes('atendido')) {
      patient.attendances++;
      patient.atendidoCount++;
      patient.hasAtLeastOneAttended = true;
    } else if (status.toLowerCase().includes('falta')) {
      patient.absences++;
    } else if (status.toLowerCase().includes('cancelado')) {
      patient.cancellations++;
      patient.canceladoCount++;
    } else if (status.toLowerCase().includes('terapeuta desmarcou') || status.toLowerCase().includes('desmarcado')) {
      patient.desmarcadoCount++;
    }
  });
  
  // Filtrar apenas pacientes que têm pelo menos uma sessão atendida
  // e que tenham status Atendido, Cancelado ou Terapeuta desmarcou
  const filteredPatients = Array.from(patientStatsMap.values()).filter(patient => {
    if (!patient.hasAtLeastOneAttended) {
      return false;
    }
    
    // Verificar se o paciente tem pelo menos um status válido (Atendido, Cancelado ou Desmarcado)
    const hasValidStatus = patient.statuses.some(status => {
      const lowerStatus = status.toLowerCase();
      return lowerStatus.includes('atendido') || 
             lowerStatus.includes('cancelado') || 
             lowerStatus.includes('terapeuta desmarcou') ||
             lowerStatus.includes('desmarcado');
    });
    
    return hasValidStatus;
  });
  
  return filteredPatients;
}

export function calculateDashboardStats(
  data: ExcelData[], 
  statusAnalysis: StatusAnalysis, 
  patientStats: PatientStats[]
): DashboardStats {
  const totalAppointments = data.length;
  const totalAbsences = statusAnalysis['Falta'] || 0;
  const totalAttendances = statusAnalysis['Atendido'] || 0;
  const overallAttendanceRate = totalAppointments > 0 ? (totalAttendances / totalAppointments * 100) : 0;
  
  const totalPatients = patientStats.length;
  const perfectAttendance = patientStats.filter(patient => 
    patient.totalAppointments > 0 && patient.absences === 0
  ).length;
  
  const attendanceRate = totalPatients > 0 ? (perfectAttendance / totalPatients * 100) : 0;
  
  return {
    totalAppointments,
    totalAbsences,
    overallAttendanceRate,
    totalPatients,
    perfectAttendance,
    attendanceRate
  };
}
