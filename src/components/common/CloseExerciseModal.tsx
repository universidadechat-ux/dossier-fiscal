import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

export const CloseExerciseModal: React.FC = () => {
  const {
    isCloseExerciseModalOpen,
    closeCloseExerciseModal,
    exerciseData,
    currentYear,
    currentCompany,
    closeCurrentExercise,
    showToast,
  } = useApp();

  const [userName, setUserName] = useState(
    currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista'
  );
  const [justification, setJustification] = useState('');
  const [forceCloseAllowed, setForceCloseAllowed] = useState(false);

  // 10 Pontos de Validação
  const diffAccounts = exerciseData.accounts.filter(
    (a) => Math.abs(a.diferenca) > 0.01
  );
  const pendingReconciliations = exerciseData.banks.filter(
    (b) => !b.reconciliacaoConcluida
  );
  const pendingAccruals = exerciseData.accruals.filter((a) => !a.lancamentoEfetuado);
  const unreviewedTA = exerciseData.autonomousTaxes.filter((t) => !t.revisto);
  const ircFinished = exerciseData.ircCalculation.estado === 'concluido';
  const fsFinished = exerciseData.financialStatements.every((f) => f.preparado);
  const openQuestions = exerciseData.questions.filter((q) => q.estado !== 'resolvido');

  const validations = [
    {
      label: 'Contas conferidas (sem diferenças de saldo)',
      passed: diffAccounts.length === 0,
      detail:
        diffAccounts.length === 0
          ? 'Todas as contas reconciliadas sem desvios'
          : `${diffAccounts.length} conta(s) com diferenças pendentes`,
    },
    {
      label: 'Reconciliações bancárias concluídas',
      passed: pendingReconciliations.length === 0,
      detail:
        pendingReconciliations.length === 0
          ? 'Todos os extratos e contas de crédito fechados'
          : `${pendingReconciliations.length} banco(s) com divergência de extrato`,
    },
    {
      label: 'Ativos conferidos e mapa Modelo 32 validado',
      passed: exerciseData.assets.length > 0,
      detail: 'Depreciações e valor líquido contabilístico conciliados com o balancete',
    },
    {
      label: 'Inventários conferidos e imparidades analisadas',
      passed: exerciseData.inventory.reconciliacaoConcluida,
      detail: 'Contagem física e reconciliação efetuadas',
    },
    {
      label: 'Acréscimos e diferimentos concluídos',
      passed: pendingAccruals.length === 0,
      detail:
        pendingAccruals.length === 0
          ? 'Todos os lançamentos do período efetuados'
          : `${pendingAccruals.length} acréscimo(s) pendente(s) de lançamento`,
    },
    {
      label: 'Subsídios conferidos (fórmula saldo inicial + recebidos - imputação)',
      passed: exerciseData.subsidies.every((s) => s.estado === 'concluido'),
      detail: 'Imputação anual conforme NCRF 22',
    },
    {
      label: 'Cálculo de IRC concluído e ponte fiscal validada',
      passed: ircFinished,
      detail:
        ircFinished
          ? 'Apuramento do RAI, matéria coletável e derrama concluído'
          : 'Cálculo de IRC ainda em aberto ou provisório',
    },
    {
      label: 'Tributações Autónomas revistas e confirmadas',
      passed: unreviewedTA.length === 0,
      detail:
        unreviewedTA.length === 0
          ? 'Todas as taxas e incidências validadas'
          : `${unreviewedTA.length} despesa(s) sem validação do revisor`,
    },
    {
      label: 'Demonstrações financeiras concluídas (Balanço, DR, Anexo)',
      passed: fsFinished,
      detail:
        fsFinished
          ? 'Todas as peças contabilísticas preparadas'
          : 'Existem demonstrações financeiras obrigatórias por concluir',
    },
    {
      label: 'Documentação comprobatória arquivada no Dossier Fiscal',
      passed: exerciseData.documents.length >= 5,
      detail: `${exerciseData.documents.length} documentos indexados no repositório`,
    },
    {
      label: 'Revisão efetuada por utilizador certificado',
      passed: openQuestions.length === 0,
      detail:
        openQuestions.length === 0
          ? 'Sem questões pendentes em aberto'
          : `${openQuestions.length} questão(ões) técnica(s) por responder`,
    },
  ];

  const totalPassed = validations.filter((v) => v.passed).length;
  const hasBlockers = totalPassed < validations.length;

  const handleClose = () => {
    if (hasBlockers && !forceCloseAllowed) {
      showToast('Existem pontos de controlo pendentes. É necessária autorização expressa.', 'error');
      return;
    }
    closeCurrentExercise(userName, justification);
    closeCloseExerciseModal();
  };

  if (!isCloseExerciseModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-slate-900" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Fechar Exercício Fiscal — Dossier Fiscal Final
              </h2>
              <p className="text-xs text-slate-500">
                {currentCompany.name} · Exercício {currentYear}
              </p>
            </div>
          </div>
          <button
            onClick={closeCloseExerciseModal}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status summary */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              hasBlockers
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {hasBlockers ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <span className="font-bold text-sm block">
                {hasBlockers
                  ? 'Atenção: Existem validações em aberto antes do fecho definitivo.'
                  : 'Pronto para fecho: Todas as validações obrigatórias foram cumpridas com sucesso.'}
              </span>
              <p className="mt-1">
                {totalPassed} de {validations.length} pontos de controlo validados. O fecho do exercício bloqueará edições e certificará o Dossier Fiscal para efeitos de arquivo e inspeção da AT.
              </p>
            </div>
          </div>

          {/* Checklist de 10 Pontos */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Validações Finais Obrigatórias:
            </h3>
            <div className="space-y-2">
              {validations.map((v, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    v.passed
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-rose-50/50 border-rose-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {v.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span className={`font-semibold ${v.passed ? 'text-slate-800' : 'text-rose-900'}`}>
                        {v.label}
                      </span>
                      <p className="text-[11px] text-slate-500">{v.detail}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      v.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {v.passed ? 'Conforme' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form de Fecho */}
          <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nome do Responsável pelo Fecho:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>

            {hasBlockers && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceCloseAllowed}
                    onChange={(e) => setForceCloseAllowed(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0"
                  />
                  <span>
                    Autorizar fecho extraordinário com ressalva / justificação de Revisor Oficial de Contas
                  </span>
                </label>
                {forceCloseAllowed && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Justificação formal do fecho com pendências:
                    </label>
                    <textarea
                      rows={2}
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Ex: Diferença bancária irrelevante coberta por depósito posterior em janeiro..."
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={closeCloseExerciseModal}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleClose}
            disabled={hasBlockers && !forceCloseAllowed}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
              hasBlockers && !forceCloseAllowed
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Confirmar e Fechar Exercício {currentYear}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
