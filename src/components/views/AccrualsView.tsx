import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
import { AccrualItem } from '../../types';
import {
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  GitCompare,
} from 'lucide-react';

export const AccrualsView: React.FC = () => {
  const {
    exerciseData,
    updateAccrual,
    addAccrual,
    deleteAccrual,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'todos' | 'acrescimos' | 'diferimentos'>('todos');
  const [editingItem, setEditingItem] = useState<AccrualItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Totais
  const totalAcrescimos = exerciseData.accruals
    .filter((a) => a.tipo === 'acrescimo')
    .reduce((sum, a) => sum + a.valor, 0);

  const totalDiferimentos = exerciseData.accruals
    .filter((a) => a.tipo === 'diferimento')
    .reduce((sum, a) => sum + a.valor, 0);

  const totalPendenteLancamento = exerciseData.accruals
    .filter((a) => !a.lancamentoEfetuado)
    .reduce((sum, a) => sum + a.valorPendente, 0);

  const filteredItems = exerciseData.accruals.filter((item) => {
    if (activeTab === 'acrescimos') return item.tipo === 'acrescimo';
    if (activeTab === 'diferimentos') return item.tipo === 'diferimento';
    return true;
  });

  const [newItem, setNewItem] = useState<Partial<AccrualItem>>({
    descricao: '',
    entidade: '',
    conta: '2811 / 622',
    tipo: 'acrescimo',
    subtipo: 'gasto_a_pagar',
    periodo: `Exercício ${currentYear}`,
    valor: 0,
    valorReconhecido: 0,
    valorPendente: 0,
    lancamentoEfetuado: false,
    documento: '',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    observacoes: '',
    estado: 'em_curso',
    preparadoPor: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    revistoPor: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.descricao || !newItem.entidade || !newItem.valor) {
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    addAccrual({
      descricao: newItem.descricao,
      entidade: newItem.entidade,
      conta: newItem.conta || '281',
      tipo: newItem.tipo as 'acrescimo' | 'diferimento',
      subtipo: newItem.subtipo as any,
      periodo: newItem.periodo || `Exercício ${currentYear}`,
      valor: Number(newItem.valor),
      valorReconhecido: Number(newItem.valorReconhecido) || 0,
      valorPendente: Number(newItem.valor) - (Number(newItem.valorReconhecido) || 0),
      lancamentoEfetuado: !!newItem.lancamentoEfetuado,
      documento: newItem.documento || '',
      responsavel: newItem.responsavel || 'Contabilista',
      observacoes: newItem.observacoes || '',
      estado: newItem.estado as any || 'em_curso',
      preparadoPor: newItem.preparadoPor || 'Contabilista',
      revistoPor: '',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateAccrual(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar "${desc}"?`)) {
      deleteAccrual(id);
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
            <TrendingDown className="w-5 h-5 text-indigo-600" />
            <span>Acréscimos e Diferimentos (Contas 28)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controlo e periodização de gastos e rendimentos com base na NCRF 21 e princípio da especialização dos exercícios.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Acréscimo / Diferimento</span>
        </button>
      </div>

      {/* KPI Totais e Comparação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total de Acréscimos (Gastos a Pagar)
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(totalAcrescimos)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Exercício {currentYear} (ex: férias, energia, telecomunicações)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total de Diferimentos (Gastos a Diferir)
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(totalDiferimentos)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Exercício {currentYear} (ex: seguros, rendas, licenças anuais)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Lançamentos Pendentes
          </span>
          <div className={`text-xl font-bold font-mono mt-1 ${totalPendenteLancamento > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {formatCurrency(totalPendenteLancamento)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {exerciseData.accruals.filter((a) => !a.lancamentoEfetuado).length} itens sem lançamento no ERP
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'todos'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todos os Registos ({exerciseData.accruals.length})
        </button>
        <button
          onClick={() => setActiveTab('acrescimos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'acrescimos'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Apenas Acréscimos (281)
        </button>
        <button
          onClick={() => setActiveTab('diferimentos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'diferimentos'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Apenas Diferimentos (282)
        </button>
      </div>

      {/* Tabela de Itens */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Descrição / Operação</th>
                <th className="px-4 py-3">Fornecedor / Entidade</th>
                <th className="px-4 py-3">Conta</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3 text-center">Lançamento</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const badge = getStatusBadge(item.estado);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{item.descricao}</div>
                      {item.documento && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3" />
                          <span>{item.documento}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.entidade}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{item.conta}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-slate-100 font-medium text-slate-700">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.periodo}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(item.valor)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          item.lancamentoEfetuado
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.lancamentoEfetuado ? 'Efetuado' : 'Por lançar'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badge.bgClass} ${badge.textClass}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.descricao)}
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

      {/* Modal Edição */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Editar Acréscimo / Diferimento</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={editingItem.descricao}
                  onChange={(e) => setEditingItem({ ...editingItem, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor Total (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.valor}
                    onChange={(e) => setEditingItem({ ...editingItem, valor: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lançamento Efetuado?</label>
                  <select
                    value={editingItem.lancamentoEfetuado ? 'true' : 'false'}
                    onChange={(e) => setEditingItem({ ...editingItem, lancamentoEfetuado: e.target.value === 'true' })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="true">Sim (Lançado)</option>
                    <option value="false">Não (Pendente)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Documento Associado</label>
                <input
                  type="text"
                  value={editingItem.documento}
                  onChange={(e) => setEditingItem({ ...editingItem, documento: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adição */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Novo Acréscimo ou Diferimento</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  placeholder="Ex: Férias e encargos a liquidar em 2027"
                  value={newItem.descricao}
                  onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={newItem.tipo}
                    onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="acrescimo">Acréscimo (Gasto a Pagar - 281)</option>
                    <option value="diferimento">Diferimento (Gasto a Diferir - 282)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.valor}
                    onChange={(e) => setNewItem({ ...newItem, valor: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Entidade / Fornecedor *</label>
                <input
                  type="text"
                  placeholder="Ex: EDP Comercial / Quadro de Pessoal"
                  value={newItem.entidade}
                  onChange={(e) => setNewItem({ ...newItem, entidade: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
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
                  Registar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
