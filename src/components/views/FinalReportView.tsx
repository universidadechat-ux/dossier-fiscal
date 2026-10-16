import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent, formatNIF } from '../../utils/formatters';
import {
  FileText,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

export const FinalReportView: React.FC = () => {
  const { currentCompany, currentYear, exerciseData, progress, showToast } = useApp();

  const diffAccounts = exerciseData.accounts.filter(
    (a) => Math.abs(a.diferenca) > 0.01
  );
  const pendingTasks = exerciseData.tasks.filter((t) => t.estado !== 'concluido');
  const openQuestions = exerciseData.questions.filter((q) => q.estado !== 'resolvido');
  const missingDocsCount = Math.max(0, 10 - exerciseData.documents.length);

  const ircEstimado =
    (exerciseData.ircCalculation.resultadoContabilisticoAntesImpostos * exerciseData.ircCalculation.taxaIrc) -
    exerciseData.ircCalculation.retencoesNaFonte -
    exerciseData.ircCalculation.pagamentosPorConta;

  const totalTA = exerciseData.autonomousTaxes.reduce((sum, t) => sum + (t.valorTA || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const lines = [
      `RELATÓRIO DE ENCERRAMENTO CONTABILÍSTICO E FISCAL`,
      `Empresa: ${currentCompany.name}`,
      `NIF: ${currentCompany.nif}`,
      `Exercício Fiscal: ${currentYear}`,
      `Data de Emissão: ${new Date().toLocaleDateString('pt-PT')}`,
      ``,
      `SÍNTESE EXECUTIVA DE CONCLUSÃO:`,
      `Conclusão Global: ${progress.global}%`,
      `Encerramento Contabilístico: ${progress.contabilistico}%`,
      `Encerramento Fiscal: ${progress.fiscal}%`,
      `Dossier Fiscal: ${progress.dossierFiscal}%`,
      ``,
      `RESUMO FISCAL:`,
      `Resultado Contabilístico antes de Impostos (RAI): ${exerciseData.ircCalculation.resultadoContabilisticoAntesImpostos} €`,
      `IRC Estimado Apurado: ${ircEstimado} €`,
      `Tributações Autónomas: ${totalTA} €`,
      ``,
      `PONTOS DE AUDITORIA:`,
      `Contas com diferenças: ${diffAccounts.length}`,
      `Tarefas pendentes: ${pendingTasks.length}`,
      `Questões por resolver: ${openQuestions.length}`,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Encerramento_${currentCompany.name}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório exportado para CSV / Excel com sucesso.');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header com botões de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dossier Fiscal & Relatórios
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Relatório Final de Encerramento Contabilístico e Fiscal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Documento formal para arquivo no Dossier Fiscal e apresentação à Administração / Revisor Oficial de Contas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* Relatório Imprimível Formal */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-900">
        {/* Cabeçalho do Relatório */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
              Relatório Executivo de Encerramento
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {currentCompany.name}
            </h2>
            <div className="text-xs text-slate-500 space-y-0.5 mt-2">
              <p>NIF: {formatNIF(currentCompany.nif)} · CAE: {currentCompany.cae}</p>
              <p>Regime de IRC: {currentCompany.regimeIrc} · Periodicidade de IVA: {currentCompany.regimeIva}</p>
              <p>Responsável Principal: {currentCompany.responsavelPrincipal}</p>
              {currentCompany.revisor && <p>Revisor / ROC: {currentCompany.revisor}</p>}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Exercício Fiscal
            </span>
            <span className="text-3xl font-bold font-mono text-slate-900 block mt-0.5">
              {currentYear}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Emitido a: {new Date().toLocaleDateString('pt-PT')}
            </span>
          </div>
        </div>

        {/* 1. Síntese Executiva de Conclusão */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            1. Estado Global do Encerramento
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Conclusão Global</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-1">
                {progress.global}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Contabilidade</span>
              <span className="text-xl font-bold font-mono text-emerald-700 block mt-1">
                {progress.contabilistico}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Fiscalidade</span>
              <span className="text-xl font-bold font-mono text-blue-700 block mt-1">
                {progress.fiscal}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Dossier Fiscal</span>
              <span className="text-xl font-bold font-mono text-indigo-700 block mt-1">
                {progress.dossierFiscal}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Síntese Fiscal & IRC Estimado */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Resumo Fiscal e Coleta de IRC
          </h3>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
            <div className="p-3 flex justify-between">
              <span className="text-slate-700">Resultado Contabilístico antes de Impostos (RAI):</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(exerciseData.ircCalculation.resultadoContabilisticoAntesImpostos)}
              </span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-slate-700">Tributações Autónomas Apuradas (Art. 88.º CIRC):</span>
              <span className="font-mono font-bold text-indigo-700">
                {formatCurrency(totalTA)}
              </span>
            </div>
            <div className="p-3 flex justify-between bg-slate-50 font-bold">
              <span>IRC Estimado do Exercício:</span>
              <span className={`font-mono ${ircEstimado > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {formatCurrency(ircEstimado)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Pontos de Auditoria e Diferenças em Aberto */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Pontos de Atenção e Divergências Identificadas
          </h3>
          <div className="space-y-2 text-xs">
            {diffAccounts.length === 0 ? (
              <p className="text-emerald-700 font-medium">
                ✓ Todas as contas reconciliadas sem desvios relevantes.
              </p>
            ) : (
              diffAccounts.map((a) => (
                <div
                  key={a.id}
                  className="p-2.5 rounded border border-rose-200 bg-rose-50/40 flex justify-between"
                >
                  <span>
                    • Conta {a.codigoConta} ({a.descricao}): {a.motivoDiferenca || 'Diferença em conferência'}
                  </span>
                  <span className="font-mono font-bold text-rose-700">
                    Desvio: {formatCurrency(a.diferenca)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Notas de Encerramento e Deliberações */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            4. Principais Deliberações e Decisões Técnicas
          </h3>
          <div className="space-y-2 text-xs">
            {exerciseData.notes.map((n) => (
              <div key={n.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                <span className="font-bold text-slate-900 block">{n.assunto} ({n.data})</span>
                <p className="text-slate-600 mt-1">{n.descricao}</p>
                <div className="text-[11px] text-slate-500 mt-2 font-medium">
                  Conclusão: {n.conclusao} · Responsável: {n.responsavel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assinaturas */}
        <div className="pt-12 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-slate-300 pb-8 mb-2" />
            <span className="font-bold text-slate-800 block">O Contabilista Certificado</span>
            <span className="text-[11px] text-slate-500">{currentCompany.responsavelPrincipal}</span>
          </div>

          <div>
            <div className="border-b border-slate-300 pb-8 mb-2" />
            <span className="font-bold text-slate-800 block">A Gerência / Conselho de Administração</span>
            <span className="text-[11px] text-slate-500">{currentCompany.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
