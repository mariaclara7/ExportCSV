import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    // Tentar diferentes formatos de data
    let date: Date;
    
    if (dateString.includes('/')) {
      // Formato DD/MM/YYYY ou DD/MM/YYYY HH:MM
      const parts = dateString.split(' ')[0].split('/');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        date = new Date(dateString);
      }
    } else if (dateString.includes('-')) {
      // Formato YYYY-MM-DD
      date = new Date(dateString);
    } else {
      // Tentar parse direto
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return dateString; // Retorna string original se não conseguir parsear
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString; // Retorna string original em caso de erro
  }
}
