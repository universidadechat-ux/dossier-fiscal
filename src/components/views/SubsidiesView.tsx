import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
import { SubsidyItem } from '../../types';
import {
  Coins,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Calculator,
} from 'lucide-react';

export const SubsidiesView: React.FC = () => {
  const {
    exerciseData,
    updateSubsidy,
    addSubsidy,
    deleteSubsidy,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [editingItem, setEditingItem] = useState<SubsidyItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Totais
  const totalAprovado = exerciseData.subsidies.reduce((sum, s) => sum + s.montanteAprovado, 0);
  const totalRecebido = exerciseData.subsidies.reduce((sum, s) => sum + s.montanteRecebido, 0);
  const totalImputadoExercicio = exerciseData.subsidies.reduce(
    (sum, s) => sum + s.montanteReconhecidoExercicio,
    0
  );
  const totalSaldoPorReconhecer = exerciseData.subsidies.reduce(
    (sum, s) => sum + s.saldoPorReconhecer,
    0
  );

  const [newSub, setNewSub] = useState<Partial<SubsidyItem>>({
    nome: '',
    entidadeConcedente: 'IAPMEI / Portugal 2030',
    referencia: '',
    dataAprovacao: `10/01/${currentYear}`,
    montanteAprovado: 0,
    montanteRecebido: 0,
    montanteJaReconhecido: 0,
    montanteReconhecidoExercicio: 0,
    saldoPorReconhecer: 0,
    metodoImputacao: 'Imputação na proporção da depreciação dos ativos adquiridos (NCRF 22)',
    contasUtilizadas: '593 / 7883',
    documentacao: '',
    impactoContabilistico: 'Rendimento reconhecido em 7883.',
    impactoFiscal: 'Tributado na proporção das depreciações aceites fiscalmente.',
    observacoes: '',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    estado: 'concluido',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.nome || !newSub.montanteAprovado) {
      showToast('Preencha os campos obrigatórios do subsídio.', 'error');
      return;
    }

    const montanteRecebido = Number(newSub.montanteRecebido) || 0;
    const montanteJaReconhecido = Number(newSub.montanteJaReconhecido) || 0;
    const montanteReconhecidoExercicio = Number(newSub.montanteReconhecidoExercicio) || 0;
    const saldoPorReconhecer = Math.max(
      0,
      montanteRecebido - montanteJaReconhecido - montanteReconhecidoExercicio
    );

    addSubsidy({
      nome: newSub.nome,
      entidadeConcedente: newSub.entidadeConcedente || 'IAPMEI',
      referencia: newSub.referencia || '',
      dataAprovacao: newSub.dataAprovacao || `01/01/${currentYear}`,
      montanteAprovado: Number(newSub.montanteAprovado),
      montanteRecebido,
      montanteJaReconhecido,
      montanteReconhecidoExercicio,
      saldoPorReconhecer,
      metodoImputacao: newSub.metodoImputacao || 'Proporcional',
      contasUtilizadas: newSub.contasUtilizadas || '593 / 7883',
      documentacao: newSub.documentacao || '',
      impactoContabilistico: newSub.impactoContabilistico || '',
      impactoFiscal: newSub.impactoFiscal || '',
      observacoes: newSub.observacoes || '',
      responsavel: newSub.responsavel || 'Contabilista',
      estado: (newSub.estado as any) || 'concluido',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateSubsidy(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar o subsídio "${nome}"?`)) {
      deleteSubsidy(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            1. Encerramento Contabilístico
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-600" />
            <span>Imputação de Subsídios ao Investimento (NCRF 22)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fórmula de controlo: Saldo Inicial + Subsídios Recebidos - Imputação do Exercício = Saldo Final a Reconhecer.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Subsídio</span>
        </button>
      </div>

      {/* KPI Cards: Saldo Inicial + Recebidos - Imputação = Saldo Final */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Montante Aprovado
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalAprovado)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Termo de Aceitação</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Montante Recebido
          </span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            {formatCurrency(totalRecebido)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Comprovativo Bancário</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Imputação do Exercício
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(totalImputadoExercicio)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Reconhecido em 7883 ({currentYear})</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Saldo por Reconhecer
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalSaldoPorReconhecer)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Passivo diferido (Conta 593)</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Nome do Projeto / Programa</th>
                <th className="px-4 py-3">Entidade Concedente</th>
                <th className="px-4 py-3 text-right">Aprovado</th>
                <th className="px-4 py-3 text-right">Recebido</th>
                <th className="px-4 py-3 text-right">Imputação {currentYear}</th>
                <th className="px-4 py-3 text-right">Saldo Final</th>
                <th className="px-4 py-3">Critério NCRF 22</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.subsidies.map((sub) => {
                const badge = getStatusBadge(sub.estado);
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{sub.nome}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Ref: {sub.referencia} · Aprovado em: {sub.dataAprovacao}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{sub.entidadeConcedente}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {formatCurrency(sub.montanteAprovado)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(sub.montanteRecebido)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      {formatCurrency(sub.montanteReconhecidoExercicio)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(sub.saldoPorReconhecer)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate">
                      {sub.metodoImputacao}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badge.bgClass} ${badge.textClass}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingItem(sub)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.nome)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adição */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Registar Novo Subsídio</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Subsídio / Programa *</label>
                <input
                  type="text"
                  placeholder="Ex: Vale Incubação / Apoio à Transição Digital"
                  value={newSub.nome}
                  onChange={(e) => setNewSub({ ...newSub, nome: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entidade Concedente</label>
                  <input
                    type="text"
                    value={newSub.entidadeConcedente}
                    onChange={(e) => setNewSub({ ...newSub, entidadeConcedente: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referência do Projeto</label>
                  <input
                    type="text"
                    placeholder="Ex: PT2030-DIGI-1029"
                    value={newSub.referencia}
                    onChange={(e) => setNewSub({ ...newSub, referencia: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aprovado (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSub.montanteAprovado}
                    onChange={(e) => setNewSub({ ...newSub, montanteAprovado: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recebido (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSub.montanteRecebido}
                    onChange={(e) => setNewSub({ ...newSub, montanteRecebido: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Imputação {currentYear} (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSub.montanteReconhecidoExercicio}
                    onChange={(e) => setNewSub({ ...newSub, montanteReconhecidoExercicio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contas Utilizadas</label>
                <input
                  type="text"
                  value={newSub.contasUtilizadas}
                  onChange={(e) => setNewSub({ ...newSub, contasUtilizadas: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Registar Subsídio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
