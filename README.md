# 📊 Dashboard Excel/CSV - React + TypeScript + shadcn/ui

Uma aplicação web moderna para análise de dados de arquivos Excel com foco em status e métricas, migrada para React com TypeScript e shadcn/ui.

## 🚀 Funcionalidades

- **Upload de Arquivos Excel/CSV**: Suporte para formatos .xlsx, .xls e .csv
- **Análise Automática de Status**: Detecta automaticamente colunas de status
- **Dashboard Interativo**: Visualizações em tempo real com gráficos
- **Estatísticas Detalhadas**: Cards com métricas importantes
- **Tabela de Pacientes Premiados**: Pacientes com 100% de presença
- **Design Moderno**: Interface com shadcn/ui e Tailwind CSS
- **TypeScript**: Tipagem forte para melhor desenvolvimento
- **Responsivo**: Funciona em desktop, tablet e mobile

## 🛠️ Tecnologias Utilizadas

- **React 18**: Biblioteca de interface de usuário
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e servidor de desenvolvimento
- **shadcn/ui**: Componentes de interface modernos
- **Tailwind CSS**: Framework CSS utilitário
- **Chart.js**: Gráficos interativos
- **SheetJS**: Leitura de arquivos Excel
- **Lucide React**: Ícones modernos

## 📁 Estrutura do Projeto

```
excel-dashboard-react/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes shadcn/ui
│   │   ├── FileUpload.tsx  # Upload de arquivos
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   ├── StatsCards.tsx # Cards de estatísticas
│   │   ├── Charts.tsx      # Gráficos
│   │   └── AwardsTable.tsx # Tabela de pacientes
│   ├── hooks/              # Custom hooks
│   │   └── useExcelDashboard.ts
│   ├── lib/                # Utilitários
│   │   ├── utils.ts
│   │   └── excelProcessor.ts
│   ├── types/              # Definições de tipos
│   ├── App.tsx               # Componente principal
│   └── main.tsx          # Ponto de entrada
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎯 Como Usar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Build para produção**:
   ```bash
   npm run build
   ```

4. **Abrir no navegador**: http://localhost:5173

## 📊 Funcionalidades Migradas

### ✅ Componentes Migrados
- [x] Upload de arquivos com drag & drop
- [x] Dashboard principal com estatísticas
- [x] Cards de métricas
- [x] Gráficos de linha e barras
- [x] Tabela de pacientes premiados
- [x] Sistema de loading e erros

### ✅ Melhorias Implementadas
- [x] TypeScript para tipagem forte
- [x] Componentes reutilizáveis
- [x] Custom hooks para lógica
- [x] Interface moderna com shadcn/ui
- [x] Responsividade melhorada
- [x] Acessibilidade aprimorada

## 🎨 Design System

O projeto utiliza o design system do shadcn/ui com:
- **Cores**: Sistema de cores consistente
- **Tipografia**: Hierarquia clara de textos
- **Espaçamento**: Grid system responsivo
- **Componentes**: Biblioteca de componentes reutilizáveis
- **Animações**: Transições suaves

## 📱 Compatibilidade

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 🔧 Desenvolvimento

### Estrutura de Componentes
- **FileUpload**: Upload com drag & drop
- **Dashboard**: Layout principal
- **StatsCards**: Cards de estatísticas
- **Charts**: Gráficos interativos
- **AwardsTable**: Tabela de pacientes

### Custom Hooks
- **useExcelDashboard**: Gerencia estado da aplicação

### Utilitários
- **excelProcessor**: Processamento de arquivos
- **utils**: Funções auxiliares

## 📈 Métricas Disponíveis

- **Total de Agendamentos**: Quantidade total
- **Faltas Registradas**: Número de faltas
- **Taxa de Presença Geral**: Percentual geral
- **Total de Pacientes**: Número de pacientes únicos
- **100% Presença**: Pacientes perfeitos
- **Taxa de Presença**: Percentual de pacientes perfeitos

## 🚀 Próximas Funcionalidades

- [ ] Exportação de relatórios em PDF
- [ ] Filtros avançados por data
- [ ] Múltiplas planilhas
- [ ] Análise de tendências temporais
- [ ] Comparação entre períodos
- [ ] Modo escuro
- [ ] Internacionalização

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e comerciais.
