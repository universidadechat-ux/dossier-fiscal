import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
import { AssetItem } from '../../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const AssetsView: React.FC = () => {
  const {
    exerciseData,
    updateAsset,
    addAsset,
    deleteAsset,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Totais do Mapa de Ativos
  const totalAquisicao = exerciseData.assets.reduce((sum, a) => sum + a.valorAquisicao, 0);
  const totalDepreciacaoAcumulada = exerciseData.assets.reduce((sum, a) => sum + a.depreciacaoAcumulada, 0);
  const totalValorLiquido = exerciseData.assets.reduce((sum, a) => sum + a.valorLiquido, 0);

  // Reconciliação: Mapa de Ativos vs Contabilidade (Conta 43 / 44 no balancete)
  const saldoContabilisticoAtivos = exerciseData.accounts
    .filter((a) => a.codigoConta.startsWith('43') || a.codigoConta.startsWith('44'))
    .reduce((sum, a) => sum + a.saldoContabilistico, 0);

  const diferencaReconciliacao = Number((saldoContabilisticoAtivos - totalAquisicao).toFixed(2));

  const filteredAssets = exerciseData.assets.filter((a) => {
    if (activeCategory === 'todos') return true;
    return a.categoria === activeCategory;
  });

  const [newAsset, setNewAsset] = useState<Partial<AssetItem>>({
    numeroAtivo: `AT-00${exerciseData.assets.length + 1}`,
    descricao: '',
    categoria: 'equipamentos',
    tipoMovimento: 'aquisicao',
    dataAquisicao: `15/06/${currentYear}`,
    valorAquisicao: 0,
    valorContabilistico: 0,
    depreciacaoAcumulada: 0,
    valorLiquido: 0,
    taxaDepreciacao: 25.0,
    conta: '43.3',
    centroCusto: 'Geral',
    documento: '',
    diferencaReconciliacao: 0,
    observacoes: '',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    estado: 'concluido',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.numeroAtivo || !newAsset.descricao || !newAsset.valorAquisicao) {
      showToast('Preencha os campos obrigatórios do ativo.', 'error');
      return;
    }

    const valorAquisicao = Number(newAsset.valorAquisicao) || 0;
    const depreciacaoAcumulada = Number(newAsset.depreciacaoAcumulada) || 0;
    const valorLiquido = Number((valorAquisicao - depreciacaoAcumulada).toFixed(2));

    addAsset({
      numeroAtivo: newAsset.numeroAtivo,
      descricao: newAsset.descricao,
      categoria: newAsset.categoria as any,
      tipoMovimento: newAsset.tipoMovimento as any,
      dataAquisicao: newAsset.dataAquisicao || `01/01/${currentYear}`,
      valorAquisicao,
      valorContabilistico: valorAquisicao,
      depreciacaoAcumulada,
      valorLiquido,
      taxaDepreciacao: Number(newAsset.taxaDepreciacao) || 20,
      conta: newAsset.conta || '43',
      centroCusto: newAsset.centroCusto || 'Sede',
      documento: newAsset.documento || '',
      diferencaReconciliacao: 0,
      observacoes: newAsset.observacoes || '',
      responsavel: newAsset.responsavel || 'Contabilista',
      estado: (newAsset.estado as any) || 'concluido',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    const valorAquisicao = Number(editingAsset.valorAquisicao) || 0;
    const depreciacaoAcumulada = Number(editingAsset.depreciacaoAcumulada) || 0;
    const valorLiquido = Number((valorAquisicao - depreciacaoAcumulada).toFixed(2));
    updateAsset(editingAsset.id, {
      ...editingAsset,
      valorAquisicao,
      depreciacaoAcumulada,
      valorLiquido,
    });
    setEditingAsset(null);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar o ativo "${desc}"?`)) {
      deleteAsset(id);
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
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Gestão de Ativos (Modelo 32 & Reconciliação)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controlo de aquisições, abates, alienações e conferência entre o Mapa Fiscal de Depreciações e a Contabilidade.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Ativo / Movimento</span>
        </button>
      </div>

      {/* Reconciliação: MAPA DE ATIVOS VS CONTABILIDADE (Secção 7) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Reconciliação: Mapa de Ativos vs Contabilidade (Classe 4)
            </h3>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              Math.abs(diferencaReconciliacao) < 0.01
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {Math.abs(diferencaReconciliacao) < 0.01 ? 'Conferência Fechada a Zeros' : 'Diferença Detetada'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Total Aquisição (Mapa)</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
              {formatCurrency(totalAquisicao)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Depreciação Acumulada</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
              {formatCurrency(totalDepreciacaoAcumulada)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Valor Líquido Contabilístico</span>
            <span className="text-base font-bold font-mono text-indigo-700 mt-0.5 block tabular-nums">
              {formatCurrency(totalValorLiquido)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Desvio vs Balancete</span>
            <span
              className={`text-base font-bold font-mono mt-0.5 block tabular-nums ${
                Math.abs(diferencaReconciliacao) > 0.01 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatCurrency(diferencaReconciliacao)}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros de Categoria */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs">
        {['todos', 'viaturas', 'imoveis', 'equipamentos', 'outros'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer capitalize ${
              activeCategory === cat
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat === 'todos' ? `Todos os Ativos (${exerciseData.assets.length})` : cat}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">N.º Ativo</th>
                <th className="px-4 py-3">Descrição do Bem</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Data Aq.</th>
                <th className="px-4 py-3 text-right">Valor Aquisição</th>
                <th className="px-4 py-3 text-right">Deprec. Acum.</th>
                <th className="px-4 py-3 text-right">Valor Líquido</th>
                <th className="px-4 py-3 text-center">Taxa (%)</th>
                <th className="px-4 py-3">Conta / CC</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {ast.numeroAtivo}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{ast.descricao}</div>
                    {ast.observacoes && (
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {ast.observacoes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{ast.categoria}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                    {ast.dataAquisicao}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(ast.valorAquisicao)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                    {formatCurrency(ast.depreciacaoAcumulada)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700 tabular-nums">
                    {formatCurrency(ast.valorLiquido)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                    {ast.taxaDepreciacao}%
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {ast.conta} · {ast.centroCusto}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingAsset(ast)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ast.id, ast.descricao)}
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

      {/* Modal Edição */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Editar Ativo — {editingAsset.numeroAtivo}
              </h3>
              <button onClick={() => setEditingAsset(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Bem</label>
                <input
                  type="text"
                  value={editingAsset.descricao}
                  onChange={(e) => setEditingAsset({ ...editingAsset, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor de Aquisição (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingAsset.valorAquisicao}
                    onChange={(e) => setEditingAsset({ ...editingAsset, valorAquisicao: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Depreciação Acumulada (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingAsset.depreciacaoAcumulada}
                    onChange={(e) => setEditingAsset({ ...editingAsset, depreciacaoAcumulada: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taxa Fiscal / Contabilística (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingAsset.taxaDepreciacao}
                    onChange={(e) => setEditingAsset({ ...editingAsset, taxaDepreciacao: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Conta Contabilística</label>
                  <input
                    type="text"
                    value={editingAsset.conta}
                    onChange={(e) => setEditingAsset({ ...editingAsset, conta: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações e Reconciliação</label>
                <textarea
                  rows={2}
                  value={editingAsset.observacoes}
                  onChange={(e) => setEditingAsset({ ...editingAsset, observacoes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
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
              <h3 className="text-sm font-bold text-slate-900">Novo Ativo / Aquisição</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N.º do Ativo *</label>
                  <input
                    type="text"
                    value={newAsset.numeroAtivo}
                    onChange={(e) => setNewAsset({ ...newAsset, numeroAtivo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newAsset.categoria}
                    onChange={(e) => setNewAsset({ ...newAsset, categoria: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="viaturas">Viaturas</option>
                    <option value="imoveis">Imóveis</option>
                    <option value="equipamentos">Equipamentos</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Bem *</label>
                <input
                  type="text"
                  placeholder="Ex: Servidor de Aplicações HP ProLiant"
                  value={newAsset.descricao}
                  onChange={(e) => setNewAsset({ ...newAsset, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor de Aquisição (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAsset.valorAquisicao}
                    onChange={(e) => setNewAsset({ ...newAsset, valorAquisicao: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taxa Depreciação (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAsset.taxaDepreciacao}
                    onChange={(e) => setNewAsset({ ...newAsset, taxaDepreciacao: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
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
                  Adicionar ao Mapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
