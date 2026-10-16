import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Upload,
  ArrowRight,
} from 'lucide-react';

export const InventoriesView: React.FC = () => {
  const { exerciseData, updateInventory, currentYear, currentCompany, showToast } = useApp();
  const inv = exerciseData.inventory;

  const [valorContabilistico, setValorContabilistico] = useState(inv.valorContabilistico);
  const [valorFisico, setValorFisico] = useState(inv.valorFisico);
  const [valorImparidade, setValorImparidade] = useState(inv.valorImparidade);
  const [metodo, setMetodo] = useState(inv.metodoValorizacao);
  const [observacoes, setObservacoes] = useState(inv.observacoes);

  const diferenca = Number((valorContabilistico - valorFisico).toFixed(2));
  const valorFinal = Number((valorFisico - valorImparidade).toFixed(2));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateInventory({
      valorContabilistico: Number(valorContabilistico),
      valorFisico: Number(valorFisico),
      valorImparidade: Number(valorImparidade),
      metodoValorizacao: metodo,
      observacoes,
    });
    showToast('Dados de inventários atualizados com sucesso.');
  };

  const toggleCheck = (field: keyof typeof inv) => {
    updateInventory({
      [field]: !inv[field],
    });
  };

  const badge = getStatusBadge(inv.estado);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            1. Encerramento Contabilístico
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <span>Inventários & Quebras Físicas (Classe 3)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controlo de contagens físicas, reconciliação de diferenças de armazém, imparidades e comunicação à AT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${badge.bgClass} ${badge.textClass}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* 5 Cartões Principais de Valor (Secção 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Valor Contabilístico
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(inv.valorContabilistico)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Saldo ERP Classe 3</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Valor Inventário Físico
          </span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            {formatCurrency(inv.valorFisico)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Contagem a 31/12</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Diferença Apurada
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 tabular-nums ${
              Math.abs(inv.diferenca) > 0.01 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(inv.diferenca)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {Math.abs(inv.diferenca) > 0.01 ? 'Quebra / Sobra' : 'Sem desvios'}
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Valor de Imparidade
          </span>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
            {formatCurrency(inv.valorImparidade)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Art. 28.º do CIRC</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Valor Final Balanço
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(inv.valorFinal)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Balanço a 31/12</span>
        </div>
      </div>

      {/* Grid: Perguntas de Controlo e Formulário de Regularização */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perguntas de Controlo (Secção 8) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Perguntas de Controlo de Inventários
          </h3>

          <div className="space-y-3">
            {[
              { id: 'inventarioRecebido', label: 'Inventário e listagem recebidos do armazém?', state: inv.inventarioRecebido },
              { id: 'contagemEfetuada', label: 'Contagem física efetuada e confirmada em auto?', state: inv.contagemEfetuada },
              { id: 'reconciliacaoConcluida', label: 'Reconciliação entre físico e contabilístico concluída?', state: inv.reconciliacaoConcluida },
              { id: 'diferencasJustificadas', label: 'Diferenças de contagem devidamente justificadas?', state: inv.diferencasJustificadas },
              { id: 'imparidadeAnalisada', label: 'Imparidade por obsolescência analisada e documentada?', state: inv.imparidadeAnalisada },
              { id: 'comunicacaoEfetuada', label: 'Comunicação do inventário à AT efetuada quando aplicável?', state: inv.comunicacaoEfetuada },
            ].map((q) => (
              <div
                key={q.id}
                onClick={() => toggleCheck(q.id as any)}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {q.state ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-slate-800">{q.label}</span>
                </div>
                <button
                  type="button"
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                    q.state
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {q.state ? 'Sim' : 'Não'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Documento: {inv.documentoContagem || 'Ainda não associado'}</span>
          </div>
        </div>

        {/* Formulário de Regularização e Critérios */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Parâmetros de Valorização & Regularizações
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Método de Valorização das Saídas (NCRF 18)
              </label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="Custo Médio Ponderado">Custo Médio Ponderado (CMP)</option>
                <option value="FIFO">Primeiro a Entrar, Primeiro a Sair (FIFO)</option>
                <option value="Custo Padrão">Custo Padrão</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Valor Contabilístico (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorContabilistico}
                  onChange={(e) => setValorContabilistico(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Valor Inventário Físico (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorFisico}
                  onChange={(e) => setValorFisico(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Provisão / Imparidade de Inventários (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={valorImparidade}
                onChange={(e) => setValorImparidade(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Observações e Justificação de Quebras
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer font-medium"
              >
                Guardar Parâmetros de Inventário
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
