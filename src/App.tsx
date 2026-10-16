import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AuditModal } from './components/common/AuditModal';
import { DocumentationRequestModal } from './components/common/DocumentationRequestModal';
import { CloseExerciseModal } from './components/common/CloseExerciseModal';
import { AssistantDrawer } from './components/common/AssistantDrawer';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Views
import { DashboardView } from './components/views/DashboardView';
import { AccountsReviewView } from './components/views/AccountsReviewView';
import { AccrualsView } from './components/views/AccrualsView';
import { AssetsView } from './components/views/AssetsView';
import { InventoriesView } from './components/views/InventoriesView';
import { SubsidiesView } from './components/views/SubsidiesView';
import { InternalWorksView } from './components/views/InternalWorksView';
import { ImpairmentsView } from './components/views/ImpairmentsView';
import { BanksView } from './components/views/BanksView';
import { ThirdPartiesView } from './components/views/ThirdPartiesView';
import { PersonnelView } from './components/views/PersonnelView';
import { IrcCalculationView } from './components/views/IrcCalculationView';
import { AutonomousTaxView } from './components/views/AutonomousTaxView';
import { TaxBenefitsView } from './components/views/TaxBenefitsView';
import { RelatedPartiesView } from './components/views/RelatedPartiesView';
import { TaxAuthorityView } from './components/views/TaxAuthorityView';
import { DossierChecklistView } from './components/views/DossierChecklistView';
import { DocumentsView } from './components/views/DocumentsView';
import { FinancialStatementsView } from './components/views/FinancialStatementsView';
import { ClosingNotesView } from './components/views/ClosingNotesView';
import { PendingTasksView } from './components/views/PendingTasksView';
import { PendingQuestionsView } from './components/views/PendingQuestionsView';
import { ComparisonView } from './components/views/ComparisonView';
import { FinalReportView } from './components/views/FinalReportView';
import { SettingsView } from './components/views/SettingsView';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, toasts, removeToast } = useApp();

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'conferencia_contas':
        return <AccountsReviewView />;
      case 'acrescimos':
        return <AccrualsView />;
      case 'ativos':
        return <AssetsView />;
      case 'inventarios':
        return <InventoriesView />;
      case 'subsidios':
        return <SubsidiesView />;
      case 'trabalhos_propria_empresa':
        return <InternalWorksView />;
      case 'imparidades':
        return <ImpairmentsView />;
      case 'bancos':
        return <BanksView />;
      case 'terceiros':
        return <ThirdPartiesView />;
      case 'pessoal':
        return <PersonnelView />;
      case 'calculo_irc':
        return <IrcCalculationView />;
      case 'tributacoes_autonomas':
        return <AutonomousTaxView />;
      case 'beneficios_fiscais':
        return <TaxBenefitsView />;
      case 'partes_relacionadas':
        return <RelatedPartiesView />;
      case 'obrigacoes_at':
        return <TaxAuthorityView />;
      case 'dossier_checklist':
        return <DossierChecklistView />;
      case 'documentos':
        return <DocumentsView />;
      case 'demonstracoes_financeiras':
        return <FinancialStatementsView />;
      case 'notas_encerramento':
        return <ClosingNotesView />;
      case 'pendentes':
        return <PendingTasksView />;
      case 'questoes':
        return <PendingQuestionsView />;
      case 'comparacao':
        return <ComparisonView />;
      case 'relatorio':
        return <FinalReportView />;
      case 'configuracoes':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic View Viewport */}
        <main className="flex-1 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal />
      <AuditModal />
      <DocumentationRequestModal />
      <CloseExerciseModal />
      <AssistantDrawer />

      {/* Indicador de Estado de Conectividade Offline */}
      <OfflineIndicator />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-xs flex items-center gap-2.5 transition-all transform translate-y-0 ${
                toast.type === 'success'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : toast.type === 'error'
                  ? 'bg-rose-900 text-white border-rose-800'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
              )}
              <span className="font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
