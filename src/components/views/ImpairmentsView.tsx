import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
import { ImpairmentItem } from '../../types';
import { AlertCircle, Plus, Edit2, Trash2, FileText, CheckCircle2 } from 'lucide-react';

export const ImpairmentsView: React.FC = () => {
  const {
    exerciseData,
    updateImpairment,
    addImpairment,
    deleteImpairment,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [editingItem, setEditingItem] = useState<ImpairmentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalProposta = exerciseData.impairments.reduce((sum, i) => sum + i.imparidadeProposta, 0);
  const totalContabilizada = exerciseData.impairments.reduce(
    (sum, i) => sum + i.imparidadeContabilizada,
    0
  );
  const totalDiferenca = Number((totalProposta - totalContabilizada).toFixed(2));

  const [newItem, setNewItem] = useState<Partial<ImpairmentItem>>({
    descricao: '',
    entidade: '',
    categoria: 'clientes',
    valor: 0,
    risco: 'Médio',
    percentagem: 50,
    imparidadeProposta: 0,
    imparidadeContabilizada: 0,
    fundamentacao: '',
    documento: '',
    impactoFiscal: '',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    estado: 'revisao',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.descricao || !newItem.valor) {
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    const valor = Number(newItem.valor) || 0;
    const perc = Number(newItem.percentagem) || 0;
    const proposta = Number(((valor * perc) / 100).toFixed(2));
    const contabilizada = Number(newItem.imparidadeContabilizada) || 0;

    addImpairment({
      descricao: newItem.descricao,
      entidade: newItem.entidade || 'Diversos',
      categoria: newItem.categoria as any || 'clientes',
      valor,
      risco: newItem.risco as any || 'Médio',
      percentagem: perc,
      imparidadeProposta: proposta,
      imparidadeContabilizada: contabilizada,
      fundamentacao: newItem.fundamentacao || '',
      documento: newItem.documento || '',
      impactoFiscal: newItem.impactoFiscal || '',
      responsavel: newItem.responsavel || 'Contabilista',
      estado: newItem.estado as any || 'revisao',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateImpairment(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar a provisão/imparidade "${desc}"?`)) {
      deleteImpairment(id);
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
            <AlertCircle className="w-5 h-5 text-indigo-600" />
            <span>Imparidades & Provisões (NCRF 28 & Arts. 28.º-B / 39.º CIRC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Análise e documentação das perdas por imparidade em clientes, inventários e contingências de processos judiciais.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Imparidade / Provisão</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Imparidade Proposta (Técnica)
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalProposta)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Apuramento segundo o risco real</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Imparidade Já Contabilizada
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(totalContabilizada)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lançada em balancete</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Ajustamento Contabilístico em Falta
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 tabular-nums ${
              Math.abs(totalDiferenca) > 0.01 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(totalDiferenca)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {Math.abs(totalDiferenca) > 0.01 ? 'Lançamento de reforço necessário' : 'Em conformidade'}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Descrição / Processo</th>
                <th className="px-4 py-3">Entidade</th>
                <th className="px-4 py-3 text-right">Valor em Risco</th>
                <th className="px-4 py-3 text-center">Nível de Risco</th>
                <th className="px-4 py-3 text-right">Imparidade Proposta</th>
                <th className="px-4 py-3 text-right">Contabilizada</th>
                <th className="px-4 py-3">Fundamentação Legal</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.impairments.map((imp) => {
                const badge = getStatusBadge(imp.estado);
                return (
                  <tr key={imp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{imp.descricao}</span>
                      <span className="text-[11px] text-slate-400 capitalize">{imp.categoria.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{imp.entidade}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(imp.valor)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-800 text-[10px]">
                        {imp.risco} ({imp.percentagem}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 tabular-nums">
                      {formatCurrency(imp.imparidadeProposta)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      {formatCurrency(imp.imparidadeContabilizada)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px] max-w-xs">
                      <div>{imp.fundamentacao}</div>
                      {imp.impactoFiscal && (
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Fiscal: {imp.impactoFiscal}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badge.bgClass} ${badge.textClass}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingItem(imp)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(imp.id, imp.descricao)}
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

      {/* Modal Adicionar */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Registar Imparidade / Provisão</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição da Imparidade *</label>
                <input
                  type="text"
                  placeholder="Ex: Crédito de cobrança duvidosa - Cliente ABC Lda."
                  value={newItem.descricao}
                  onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entidade / Devedor</label>
                  <input
                    type="text"
                    value={newItem.entidade}
                    onChange={(e) => setNewItem({ ...newItem, entidade: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newItem.categoria}
                    onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="clientes">Clientes (Art. 28.º-B CIRC)</option>
                    <option value="inventarios">Inventários</option>
                    <option value="processos_judiciais">Processos Judiciais (Art. 39.º CIRC)</option>
                    <option value="ativos">Ativos Tangíveis</option>
                    <option value="outras">Outras Responsabilidades</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor do Crédito (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.valor}
                    onChange={(e) => setNewItem({ ...newItem, valor: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Percentagem (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={newItem.percentagem}
                    onChange={(e) => setNewItem({ ...newItem, percentagem: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contabilizada (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.imparidadeContabilizada}
                    onChange={(e) => setNewItem({ ...newItem, imparidadeContabilizada: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fundamentação Contabilística e Legal</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Art. 28.º-B, n.º 1, al. c) do CIRC (mora superior a 12 meses)..."
                  value={newItem.fundamentacao}
                  onChange={(e) => setNewItem({ ...newItem, fundamentacao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
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
                  Registar Imparidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
