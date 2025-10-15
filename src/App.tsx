import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';
import { useExcelDashboard } from '@/hooks/useExcelDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function App() {
  const {
    data,
    statusAnalysis,
    patientStats,
    dashboardStats,
    isLoading,
    error,
    processFile,
    resetDashboard
  } = useExcelDashboard();

  const hasData = data.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Dashboard Excel/CSV - Análise de Status
          </h1>
          <p className="text-xl text-gray-600">
            Faça upload de um arquivo Excel ou CSV para visualizar análises baseadas nos status dos dados
          </p>
        </header>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!hasData ? (
          <FileUpload 
            onFileSelect={processFile} 
            isLoading={isLoading} 
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Dashboard
              stats={dashboardStats}
              statusAnalysis={statusAnalysis}
              patientStats={patientStats}
              data={data}
              onReset={resetDashboard}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
