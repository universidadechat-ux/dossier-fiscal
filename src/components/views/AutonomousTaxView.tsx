import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { UNCONFIRMED_TAX_RATE } from '../../utils/taxSafety';
import { AutonomousTaxItem } from '../../types';
import {
  Percent,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export const AutonomousTaxView: React.FC = () => {
  const {
    exerciseData,
    updateAutonomousTax,
    addAutonomousTax,
    deleteAutonomousTax,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [editingItem, setEditingItem] = useState<AutonomousTaxItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Totais por categoria
  const totalGeralTA = exerciseData.autonomousTaxes.reduce((sum, t) => sum + (t.valorTA || 0), 0);
  const totalEncargosSujeitos = exerciseData.autonomousTaxes
    .filter((t) => t.sujeito)
    .reduce((sum, t) => sum + t.valor, 0);

  const totalPorCategoria = {
    viaturas: exerciseData.autonomousTaxes
      .filter((t) => t.categoria === 'viaturas')
      .reduce((sum, t) => sum + (t.valorTA || 0), 0),
    representacao: exerciseData.autonomousTaxes
      .filter((t) => t.categoria === 'despesas_representacao')
      .reduce((sum, t) => sum + (t.valorTA || 0), 0),
    deslocacoes: exerciseData.autonomousTaxes
      .filter((t) => t.categoria === 'deslocacoes' || t.categoria === 'ajudas_custo')
      .reduce((sum, t) => sum + (t.valorTA || 0), 0),
    nao_documentadas: exerciseData.autonomousTaxes
      .filter((t) => t.categoria === 'despesas_nao_documentadas')
      .reduce((sum, t) => sum + (t.valorTA || 0), 0),
  };

  const filteredItems = exerciseData.autonomousTaxes.filter((t) => {
    if (activeCategory === 'todas') return true;
    return t.categoria === activeCategory;
  });

  const [newItem, setNewItem] = useState<Partial<AutonomousTaxItem>>({
    data: `15/06/${currentYear}`,
    documento: '',
    fornecedor: '',
    descricao: '',
    contaContabilistica: '62.6',
    valor: 0,
    categoria: 'despesas_representacao',
    enquadramentoFiscal: 'Art. 88.º, n.º 7 do CIRC',
    sujeito: true,
    motivo: '',
    taxa: 0.10,
    taxaStatus: 'validada',
    valorTA: 0,
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    revisto: false,
    observacoes: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.descricao || !newItem.valor) {
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    addAutonomousTax({
      data: newItem.data || `01/01/${currentYear}`,
      documento: newItem.documento || '',
      fornecedor: newItem.fornecedor || 'Diversos',
      descricao: newItem.descricao,
      contaContabilistica: newItem.contaContabilistica || '62',
      valor: Number(newItem.valor),
      categoria: newItem.categoria as any,
      enquadramentoFiscal: newItem.enquadramentoFiscal || 'Art. 88.º CIRC',
      sujeito: newItem.sujeito ?? true,
      motivo: newItem.motivo || '',
      taxa: newItem.taxaStatus === 'por_confirmar' ? null : Number(newItem.taxa),
      taxaStatus: (newItem.taxaStatus as any) || 'validada',
      valorTA: 0, // calculado no context
      responsavel: newItem.responsavel || 'Contabilista',
      revisto: !!newItem.revisto,
      observacoes: newItem.observacoes || '',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateAutonomousTax(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar "${desc}"?`)) {
      deleteAutonomousTax(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            2. Encerramento Fiscal
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Percent className="w-5 h-5 text-indigo-600" />
            <span>Tributações Autónomas (Art. 88.º CIRC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registo e análise individual de despesas sujeitas a tributação autónoma. Taxas parametrizáveis e segurança fiscal estrita.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Despesa Sujeita</span>
        </button>
      </div>

      {/* KPI Cards: Totais por Categoria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Tributação Autónoma
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalGeralTA)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Acréscimo à coleta de IRC</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Viaturas de Passageiros
          </span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            {formatCurrency(totalPorCategoria.viaturas)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Depreciações, seguros e portagens</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Despesas de Representação
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalPorCategoria.representacao)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Taxa de 10% (Art. 88.º, n.º 7)</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Deslocações & Kms Próprios
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalPorCategoria.deslocacoes)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Taxa de 5% (Art. 88.º, n.º 9)</span>
        </div>
      </div>

      {/* Tabs de Filtro */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'todas', label: `Todas (${exerciseData.autonomousTaxes.length})` },
          { id: 'viaturas', label: 'Viaturas' },
          { id: 'despesas_representacao', label: 'Representação' },
          { id: 'deslocacoes', label: 'Deslocações & Kms' },
          { id: 'despesas_nao_documentadas', label: 'Não Documentadas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Data / Documento</th>
                <th className="px-4 py-3">Descrição da Despesa</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Valor Despesa</th>
                <th className="px-4 py-3 text-center">Taxa Fiscal</th>
                <th className="px-4 py-3 text-right">Valor TA</th>
                <th className="px-4 py-3">Enquadramento Legal</th>
                <th className="px-4 py-3 text-center">Revisão</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-slate-800 font-semibold block">{t.data}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.documento}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{t.descricao}</div>
                    <div className="text-[11px] text-slate-500">
                      Entidade: {t.fornecedor} · Conta: {t.contaContabilistica}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">
                    {t.categoria.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(t.valor)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {t.taxaStatus === 'por_confirmar' || t.taxa === null ? (
                      <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                        {UNCONFIRMED_TAX_RATE}
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-slate-900">
                        {(t.taxa * 100).toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700 tabular-nums">
                    {formatCurrency(t.valorTA)}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-600">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-medium">
                      {t.enquadramentoFiscal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.revisto
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.revisto ? 'Revisto' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingItem(t)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.descricao)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Registar Despesa para Tributação Autónoma
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição da Despesa *</label>
                <input
                  type="text"
                  placeholder="Ex: Almoço de trabalho com clientes"
                  value={newItem.descricao}
                  onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newItem.categoria}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      let suggestedTaxa = 0.10;
                      if (cat === 'viaturas') suggestedTaxa = 0.085;
                      if (cat === 'deslocacoes') suggestedTaxa = 0.05;
                      if (cat === 'despesas_nao_documentadas') suggestedTaxa = 0.50;
                      setNewItem({ ...newItem, categoria: cat, taxa: suggestedTaxa });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="despesas_representacao">Despesas de Representação (10%)</option>
                    <option value="viaturas">Viaturas Ligeiras de Passageiros</option>
                    <option value="deslocacoes">Compensações por Deslocação / Kms (5%)</option>
                    <option value="ajudas_custo">Ajudas de Custo (5%)</option>
                    <option value="despesas_nao_documentadas">Despesas Não Documentadas (50%)</option>
                    <option value="remuneracoes_bonus">Bónus / Remunerações Variáveis (35%)</option>
                    <option value="outras">Outras despesas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor da Despesa (€) *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taxa Fiscal Parametrizada</label>
                  <select
                    value={newItem.taxaStatus}
                    onChange={(e) => setNewItem({ ...newItem, taxaStatus: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="validada">Taxa Validada</option>
                    <option value="por_confirmar">Taxa fiscal por confirmar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taxa (%)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newItem.taxa !== null && newItem.taxa !== undefined ? newItem.taxa * 100 : ''}
                    disabled={newItem.taxaStatus === 'por_confirmar'}
                    onChange={(e) => setNewItem({ ...newItem, taxa: (parseFloat(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enquadramento Legal (CIRC)</label>
                <input
                  type="text"
                  placeholder="Ex: Art. 88.º, n.º 7 do CIRC"
                  value={newItem.enquadramentoFiscal}
                  onChange={(e) => setNewItem({ ...newItem, enquadramentoFiscal: e.target.value })}
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
                  Registar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
