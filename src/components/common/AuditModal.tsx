import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPercent } from '../../utils/formatters';
import {
  ClipboardCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AuditModal: React.FC = () => {
  const {
    isAuditModalOpen,
    closeAuditModal,
    exerciseData,
    progress,
    currentYear,
    currentCompany,
    setActiveView,
  } = useApp();

  if (!isAuditModalOpen) return null;

  // Cálculos automáticos do diagnóstico
  const diffAccounts = exerciseData.accounts.filter(
    (a) => Math.abs(a.diferenca) > 0.01
  );
  const pendingTasks = exerciseData.tasks.filter((t) => t.estado !== 'concluido');
  const missingAccruals = exerciseData.accruals.filter((a) => !a.lancamentoEfetuado);
  const unreviewedTA = exerciseData.autonomousTaxes.filter((t) => !t.revisto);
  const openQuestions = exerciseData.questions.filter((q) => q.estado !== 'resolvido');
  const pendingReconciliations = exerciseData.banks.filter((b) => !b.reconciliacaoConcluida);
  const ircFinished = exerciseData.ircCalculation.estado === 'concluido';
  const missingDocsCount = Math.max(0, 10 - exerciseData.documents.length);

  // Classificação de Prioridades
  const highPriorities: { title: string; area: string; view: string }[] = [];
  const mediumPriorities: { title: string; area: string; view: string }[] = [];
  const lowPriorities: { title: string; area: string; view: string }[] = [];

  if (diffAccounts.length > 0) {
    highPriorities.push({
      title: `${diffAccounts.length} contas com diferenças de saldo a justificar`,
      area: 'Conferência de Contas',
      view: 'conferencia_contas',
    });
  }
  if (!ircFinished) {
    highPriorities.push({
      title: 'Cálculo de IRC ainda em aberto ou por validar',
      area: 'Cálculo de IRC',
      view: 'calculo_irc',
    });
  }
  if (pendingReconciliations.length > 0) {
    highPriorities.push({
      title: `${pendingReconciliations.length} reconciliação(ões) bancária(s) por concluir`,
      area: 'Bancos e Financiamentos',
      view: 'bancos',
    });
  }

  if (unreviewedTA.length > 0) {
    mediumPriorities.push({
      title: `${unreviewedTA.length} despesa(s) sujeitas a Tributação Autónoma sem revisão`,
      area: 'Tributações Autónomas',
      view: 'tributacoes_autonomas',
    });
  }
  if (missingAccruals.length > 0) {
    mediumPriorities.push({
      title: `${missingAccruals.length} acréscimo(s) ou diferimento(s) com lançamento em falta`,
      area: 'Acréscimos e Diferimentos',
      view: 'acrescimos',
    });
  }
  if (openQuestions.length > 0) {
    mediumPriorities.push({
      title: `${openQuestions.length} questão(ões) fiscal(ais) ou contabilística(s) em análise`,
      area: 'Questões Pendentes',
      view: 'questoes',
    });
  }
  if (missingDocsCount > 0) {
    mediumPriorities.push({
      title: `${missingDocsCount} documento(s) ou comprovativo(s) essenciais em falta para o arquivo`,
      area: 'Documentos',
      view: 'documentos',
    });
  }

  if (pendingTasks.length > 0) {
    lowPriorities.push({
      title: `${pendingTasks.length} tarefa(s) pendente(s) da checklist de encerramento`,
      area: 'Checklist',
      view: 'pendentes',
    });
  }
  if (!exerciseData.inventory.comunicacaoEfetuada) {
    lowPriorities.push({
      title: 'Submissão de comunicação do ficheiro de inventário à AT',
      area: 'Inventários',
      view: 'inventarios',
    });
  }

  const navigateTo = (view: string) => {
    setActiveView(view);
    closeAuditModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pré-Revisão do Encerramento
              </h2>
              <p className="text-xs text-slate-500">
                {currentCompany.name} · Exercício {currentYear}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuditModal}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Global Completion Scorecard */}
          <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Estado Global do Encerramento
              </span>
              <div className="text-2xl font-bold font-mono tracking-tight mt-1">
                Encerramento concluído a {formatPercent(progress.global, 0)}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Contabilidade: {formatPercent(progress.contabilistico, 0)} · Fiscalidade:{' '}
                {formatPercent(progress.fiscal, 0)} · Dossier Fiscal:{' '}
                {formatPercent(progress.dossierFiscal, 0)}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-indigo-400 flex items-center justify-center font-bold text-lg font-mono">
              {progress.global}%
            </div>
          </div>

          {/* Diagnostic Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Diagnóstico Consolidado
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Contas c/ Diferença</span>
                <span className={`text-base font-bold font-mono ${diffAccounts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {diffAccounts.length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Tarefas Pendentes</span>
                <span className="text-base font-bold font-mono text-slate-800">
                  {pendingTasks.length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Docs em Falta</span>
                <span className="text-base font-bold font-mono text-amber-600">
                  {missingDocsCount}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Reconciliações Bancárias</span>
                <span className={`text-base font-bold font-mono ${pendingReconciliations.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {pendingReconciliations.length === 0 ? 'Fechadas' : `${pendingReconciliations.length} pendentes`}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Questões Fiscais</span>
                <span className="text-base font-bold font-mono text-slate-800">
                  {openQuestions.length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Cálculo de IRC</span>
                <span className={`text-base font-bold ${ircFinished ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {ircFinished ? 'Concluído' : 'Em Curso'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: PRIORIDADES (Secção 28) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Prioridades de Resolução
            </h3>

            {/* Prioridade Alta */}
            {highPriorities.length > 0 && (
              <div className="border border-rose-200 bg-rose-50/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Prioridade Alta ({highPriorities.length})</span>
                </div>
                <div className="space-y-1.5 pl-6">
                  {highPriorities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-800 hover:text-rose-700 cursor-pointer"
                      onClick={() => navigateTo(item.view)}
                    >
                      <span>• {item.title}</span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
                        {item.area} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prioridade Média */}
            {mediumPriorities.length > 0 && (
              <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Prioridade Média ({mediumPriorities.length})</span>
                </div>
                <div className="space-y-1.5 pl-6">
                  {mediumPriorities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-800 hover:text-amber-800 cursor-pointer"
                      onClick={() => navigateTo(item.view)}
                    >
                      <span>• {item.title}</span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
                        {item.area} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prioridade Baixa */}
            {lowPriorities.length > 0 && (
              <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                  <Clock className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Prioridade Baixa ({lowPriorities.length})</span>
                </div>
                <div className="space-y-1.5 pl-6">
                  {lowPriorities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
                      onClick={() => navigateTo(item.view)}
                    >
                      <span>• {item.title}</span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        {item.area} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={closeAuditModal}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Fechar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};
