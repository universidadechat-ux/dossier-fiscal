import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPercent, formatCurrency, getStatusBadge } from '../../utils/formatters';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Scale,
  Sparkles,
  ClipboardCheck,
  Building,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentCompany,
    currentYear,
    exerciseData,
    progress,
    attentionItems,
    setActiveView,
    openAuditModal,
    openAssistant,
  } = useApp();

  const diffAccounts = exerciseData.accounts.filter(
    (a) => Math.abs(a.diferenca) > 0.01
  );
  const pendingTasks = exerciseData.tasks.filter((t) => t.estado !== 'concluido');
  const completedTasks = exerciseData.tasks.filter((t) => t.estado === 'concluido');
  const missingAccruals = exerciseData.accruals.filter((a) => !a.lancamentoEfetuado);
  const openQuestions = exerciseData.questions.filter((q) => q.estado !== 'resolvido');
  const missingDocsCount = Math.max(0, 10 - exerciseData.documents.length);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Painel de Controlo do Exercício
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
            <span>Encerramento {currentYear}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {currentCompany.name}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            NIF: {currentCompany.nif} · Regime: {currentCompany.regimeIrc} · IVA: {currentCompany.regimeIva} · Responsável: {currentCompany.responsavelPrincipal}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openAuditModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4 text-indigo-400" />
            <span>Analisar Encerramento</span>
          </button>
          <button
            onClick={() => openAssistant('Resume as prioridades do encerramento para hoje.')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Diagnóstico IA</span>
          </button>
        </div>
      </div>

      {/* 1. AS TRÊS GRANDES FASES & CONCLUSÃO GLOBAL (Secção 1 & 36) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Global Progress Card */}
        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Conclusão Global
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {currentYear}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono tracking-tight">
                {progress.global}%
              </span>
              <span className="text-xs text-slate-400">concluído</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress.global}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{completedTasks.length} tarefas concluídas</span>
              <span>{pendingTasks.length} pendentes</span>
            </div>
          </div>
        </div>

        {/* Fase 1: Encerramento Contabilístico */}
        <div
          onClick={() => setActiveView('conferencia_contas')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                1. Contabilidade
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {progress.contabilistico}%
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
              Encerramento Contabilístico
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Conferência de contas, acréscimos, ativos e inventários
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.contabilistico}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {diffAccounts.length === 0 ? 'Contas sem desvios' : `${diffAccounts.length} c/ diferenças`}
              </span>
              <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Fase 2: Encerramento Fiscal */}
        <div
          onClick={() => setActiveView('calculo_irc')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                2. Fiscalidade
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {progress.fiscal}%
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
              Encerramento Fiscal
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Apuramento IRC, tributações autónomas e benefícios
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.fiscal}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {exerciseData.ircCalculation.estado === 'concluido' ? 'IRC Apurado' : 'IRC Provisório'}
              </span>
              <span className="flex items-center gap-0.5 text-blue-600 font-medium">
                Ponte Fiscal <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Fase 3: Dossier Fiscal */}
        <div
          onClick={() => setActiveView('dossier_checklist')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                3. Dossier Fiscal
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {progress.dossierFiscal}%
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
              Dossier Fiscal (Art. 130.º CIRC)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Demonstrações financeiras, arquivo e notas de fecho
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.dossierFiscal}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{exerciseData.documents.length} documentos indexados</span>
              <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                Checklist <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ÁREA "ATENÇÃO NECESSÁRIA" (Secção 3 & 36) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Atenção Necessária — Assuntos Críticos e Urgentes
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {attentionItems.length} ponto(s) requerem intervenção
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {attentionItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <span>Excelente! Nenhum assunto crítico ou divergência pendente neste momento.</span>
            </div>
          ) : (
            attentionItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveView(item.targetView)}
                className="px-6 py-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      item.level === 'critico'
                        ? 'bg-rose-600'
                        : item.level === 'atencao'
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {item.area}
                  </span>
                  <button className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 rounded-md group-hover:bg-slate-900 group-hover:text-white transition-colors flex items-center gap-1">
                    <span>Resolver</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. CONTADORES CHAVE DO ENCERRAMENTO (Secção 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveView('conferencia_contas')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-500 block">Contas por Conferir</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {exerciseData.accounts.filter((a) => a.estado !== 'concluido').length}
            </span>
            <span className="text-[10px] text-slate-400">de {exerciseData.accounts.length}</span>
          </div>
          {diffAccounts.length > 0 && (
            <span className="text-[10px] font-semibold text-rose-600 block mt-1">
              {diffAccounts.length} c/ diferenças
            </span>
          )}
        </div>

        <div
          onClick={() => setActiveView('documentos')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-500 block">Docs em Falta</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-amber-600">
              {missingDocsCount}
            </span>
            <span className="text-[10px] text-slate-400">estimados</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {exerciseData.documents.length} no repositório
          </span>
        </div>

        <div
          onClick={() => setActiveView('questoes')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-500 block">Questões Pendentes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {openQuestions.length}
            </span>
            <span className="text-[10px] text-slate-400">em análise</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Assuntos fiscais</span>
        </div>

        <div
          onClick={() => setActiveView('acrescimos')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-500 block">Acréscimos / Difer.</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {missingAccruals.length}
            </span>
            <span className="text-[10px] text-slate-400">por lançar</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {exerciseData.accruals.length} registados
          </span>
        </div>

        <div
          onClick={() => setActiveView('bancos')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-500 block">Reconciliações Bancárias</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {exerciseData.banks.filter((b) => !b.reconciliacaoConcluida).length}
            </span>
            <span className="text-[10px] text-slate-400">pendentes</span>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-1">
            {exerciseData.banks.filter((b) => b.reconciliacaoConcluida).length} conciliadas
          </span>
        </div>

        <div
          onClick={() => setActiveView('calculo_irc')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors cursor-pointer"
        >
          <span className="text-[11px] text-slate-500 block">IRC Estimado</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-sm font-bold font-mono text-slate-900 truncate">
              {formatCurrency(
                (exerciseData.ircCalculation.resultadoContabilisticoAntesImpostos * exerciseData.ircCalculation.taxaIrc) -
                exerciseData.ircCalculation.retencoesNaFonte -
                exerciseData.ircCalculation.pagamentosPorConta
              )}
            </span>
          </div>
          <span className="text-[10px] text-indigo-600 block mt-1">Ponte Quadro 07</span>
        </div>
      </div>

      {/* 4. PRÓXIMAS TAREFAS E PRAZOS (Secção 36) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Tarefas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Próximas Tarefas Prioritárias
            </h3>
            <button
              onClick={() => setActiveView('pendentes')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {exerciseData.tasks.slice(0, 5).map((task) => {
              const badge = getStatusBadge(task.estado);
              return (
                <div
                  key={task.id}
                  onClick={() => setActiveView('pendentes')}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="pr-2">
                    <h5 className="text-xs font-medium text-slate-800">{task.descricao}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>Área: {task.area}</span>
                      <span>·</span>
                      <span>Resp: {task.responsavel}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badge.bgClass} ${badge.textClass}`}>
                      {badge.label}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      Prazo: {task.dataLimite}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo do Dossier Fiscal & Obrigações */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Estado do Dossier Fiscal & Obrigações AT
              </h3>
              <button
                onClick={() => setActiveView('obrigacoes_at')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Ver obrigações</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {exerciseData.taxObligations.slice(0, 4).map((obl) => (
                <div
                  key={obl.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 block">{obl.descricao}</span>
                    <span className="text-[11px] text-slate-500">
                      Prazo: {obl.prazo}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {obl.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
            <span>Dossier Fiscal Artigo 130.º CIRC</span>
            <button
              onClick={() => setActiveView('dossier_checklist')}
              className="text-indigo-600 font-medium hover:underline cursor-pointer"
            >
              Abrir Checklist Completa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
