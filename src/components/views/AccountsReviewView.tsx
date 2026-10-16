import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
import { AccountCheckItem, ItemStatus } from '../../types';
import {
  Scale,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  FileText,
} from 'lucide-react';

export const AccountsReviewView: React.FC = () => {
  const {
    exerciseData,
    updateAccount,
    addAccount,
    deleteAccount,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [filterType, setFilterType] = useState<
    'todas' | 'diferencas' | 'pendentes' | 'concluidas' | 'rever'
  >('todas');
  const [selectedArea, setSelectedArea] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<AccountCheckItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Formulário de Nova Conta
  const [newContaCodigo, setNewContaCodigo] = useState('');
  const [newDescricao, setNewDescricao] = useState('');
  const [newArea, setNewArea] = useState('Bancos');
  const [newSaldoContabilistico, setNewSaldoContabilistico] = useState<number>(0);
  const [newSaldoConferido, setNewSaldoConferido] = useState<number>(0);
  const [newMotivoDiferenca, setNewMotivoDiferenca] = useState('');
  const [newResponsavel, setNewResponsavel] = useState(
    currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista'
  );
  const [newDocumento, setNewDocumento] = useState('');
  const [newObservacoes, setNewObservacoes] = useState('');

  const areasList = useMemo(() => {
    const set = new Set(exerciseData.accounts.map((a) => a.area));
    return ['todas', ...Array.from(set)];
  }, [exerciseData.accounts]);

  const filteredAccounts = useMemo(() => {
    return exerciseData.accounts.filter((acc) => {
      // Search
      const matchesSearch =
        acc.codigoConta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.responsavel.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Area
      if (selectedArea !== 'todas' && acc.area !== selectedArea) return false;

      // Filter Type
      if (filterType === 'diferencas') {
        return Math.abs(acc.diferenca) > 0.01;
      }
      if (filterType === 'pendentes') {
        return acc.estado !== 'concluido';
      }
      if (filterType === 'concluidas') {
        return acc.estado === 'concluido' && Math.abs(acc.diferenca) < 0.01;
      }
      if (filterType === 'rever') {
        return acc.estado === 'revisao';
      }

      return true;
    });
  }, [exerciseData.accounts, searchTerm, selectedArea, filterType]);

  const diffCount = exerciseData.accounts.filter((a) => Math.abs(a.diferenca) > 0.01).length;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateAccount(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContaCodigo.trim() || !newDescricao.trim()) {
      showToast('Preencha o código da conta e a descrição.', 'error');
      return;
    }

    addAccount({
      codigoConta: newContaCodigo.trim(),
      descricao: newDescricao.trim(),
      area: newArea,
      saldoContabilistico: Number(newSaldoContabilistico) || 0,
      saldoConferido: Number(newSaldoConferido) || 0,
      motivoDiferenca: newMotivoDiferenca,
      estado: 'em_curso',
      responsavel: newResponsavel,
      documentoSuporte: newDocumento,
      observacoes: newObservacoes,
      conclusao: '',
      preparadoPor: newResponsavel,
      revistoPor: '',
    });

    setIsAddModalOpen(false);
    setNewContaCodigo('');
    setNewDescricao('');
    setNewSaldoContabilistico(0);
    setNewSaldoConferido(0);
    setNewMotivoDiferenca('');
    setNewDocumento('');
    setNewObservacoes('');
  };

  const handleDelete = (id: string, codigo: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar a conta ${codigo}?`)) {
      deleteAccount(id);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Código Conta',
      'Descrição',
      'Área',
      'Saldo Contabilístico',
      'Saldo Conferido',
      'Diferença',
      'Motivo Diferença',
      'Estado',
      'Responsável',
      'Documento',
      'Observações',
    ];

    const rows = filteredAccounts.map((a) => [
      `"${a.codigoConta}"`,
      `"${a.descricao}"`,
      `"${a.area}"`,
      `"${a.saldoContabilistico.toFixed(2)}"`,
      `"${a.saldoConferido.toFixed(2)}"`,
      `"${a.diferenca.toFixed(2)}"`,
      `"${a.motivoDiferenca || ''}"`,
      `"${a.estado}"`,
      `"${a.responsavel}"`,
      `"${a.documentoSuporte || ''}"`,
      `"${a.observacoes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Conferencia_Contas_${currentCompany.name}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ficheiro CSV descarregado com sucesso.');
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
            <Scale className="w-5 h-5 text-indigo-600" />
            <span>Conferência de Contas — SNC</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conferência sistemática de saldos por conta e área de trabalho. Diferença = Saldo Contabilístico - Saldo Conferido.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Conta</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterType('todas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'todas'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas as Contas ({exerciseData.accounts.length})
          </button>
          <button
            onClick={() => setFilterType('diferencas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'diferencas'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
            }`}
          >
            <span>Com Diferenças</span>
            {diffCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-700 font-bold font-mono">
                {diffCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterType('pendentes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'pendentes'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Não Conferidas
          </button>
          <button
            onClick={() => setFilterType('rever')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'rever'
                ? 'bg-orange-600 text-white'
                : 'text-orange-700 bg-orange-50 hover:bg-orange-100'
            }`}
          >
            A Rever
          </button>
          <button
            onClick={() => setFilterType('concluidas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'concluidas'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            Concluídas
          </button>
        </div>

        {/* Area dropdown and Search input */}
        <div className="flex items-center gap-2">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 focus:outline-none"
          >
            {areasList.map((area) => (
              <option key={area} value={area}>
                {area === 'todas' ? 'Todas as Áreas' : area}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar código, descrição..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Descrição da Conta</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3 text-right">Saldo Contabilístico</th>
                <th className="px-4 py-3 text-right">Saldo Conferido</th>
                <th className="px-4 py-3 text-right">Diferença</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    Nenhuma conta encontrada para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const hasDiff = Math.abs(acc.diferenca) > 0.01;
                  const badge = getStatusBadge(acc.estado);

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        hasDiff ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {acc.codigoConta}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{acc.descricao}</div>
                        {hasDiff && acc.motivoDiferenca && (
                          <div className="text-[11px] text-rose-600 mt-0.5">
                            Motivo: {acc.motivoDiferenca}
                          </div>
                        )}
                        {acc.documentoSuporte && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3" />
                            <span>{acc.documentoSuporte}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{acc.area}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-900 tabular-nums">
                        {formatCurrency(acc.saldoContabilistico)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-900 tabular-nums">
                        {formatCurrency(acc.saldoConferido)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                          hasDiff ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(acc.diferenca)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] ${badge.bgClass} ${badge.textClass}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {acc.responsavel}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingItem(acc)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                            title="Editar conta e conferência"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(acc.id, acc.codigoConta)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 cursor-pointer"
                            title="Eliminar conta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição de Conta */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Editar Conferência — Conta {editingItem.codigoConta}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descrição da Conta
                </label>
                <input
                  type="text"
                  value={editingItem.descricao}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, descricao: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Saldo Contabilístico (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.saldoContabilistico}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditingItem({
                        ...editingItem,
                        saldoContabilistico: val,
                        diferenca: Number((val - editingItem.saldoConferido).toFixed(2)),
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Saldo Conferido (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.saldoConferido}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditingItem({
                        ...editingItem,
                        saldoConferido: val,
                        diferenca: Number((editingItem.saldoContabilistico - val).toFixed(2)),
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-slate-600 font-medium">Diferença Apurada:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    Math.abs(editingItem.saldoContabilistico - editingItem.saldoConferido) > 0.01
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {formatCurrency(
                    editingItem.saldoContabilistico - editingItem.saldoConferido
                  )}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo da Diferença (se aplicável)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.motivoDiferenca}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, motivoDiferenca: e.target.value })
                  }
                  placeholder="Ex: Fatura pendente de recebimento, comissões não debitadas..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estado da Conferência
                  </label>
                  <select
                    value={editingItem.estado}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        estado: e.target.value as ItemStatus,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="concluido">🟢 Concluído</option>
                    <option value="em_curso">🟡 Em curso</option>
                    <option value="revisao">🟠 Necessita de revisão</option>
                    <option value="em_falta">🔴 Em falta</option>
                    <option value="nao_iniciado">⚪ Não iniciado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={editingItem.responsavel}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, responsavel: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Documento de Suporte / Extrato
                </label>
                <input
                  type="text"
                  value={editingItem.documentoSuporte}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, documentoSuporte: e.target.value })
                  }
                  placeholder="Ex: Extrato Santander 31/12, Balancete Clientes..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações e Conclusão
                </label>
                <textarea
                  rows={2}
                  value={editingItem.observacoes}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, observacoes: e.target.value })
                  }
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
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação de Conta */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Adicionar Conta para Conferência — SNC
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código da Conta SNC *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 21.1.1.001"
                    value={newContaCodigo}
                    onChange={(e) => setNewContaCodigo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Área
                  </label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Caixa">Caixa</option>
                    <option value="Bancos">Bancos</option>
                    <option value="Clientes">Clientes</option>
                    <option value="Fornecedores">Fornecedores</option>
                    <option value="Estado e outros entes públicos">Estado e outros entes públicos</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Sócios/acionistas">Sócios/acionistas</option>
                    <option value="Financiamentos">Financiamentos</option>
                    <option value="Inventários">Inventários</option>
                    <option value="Ativos">Ativos</option>
                    <option value="Rendimentos">Rendimentos</option>
                    <option value="Gastos">Gastos</option>
                    <option value="Acréscimos">Acréscimos</option>
                    <option value="Diferimentos">Diferimentos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descrição da Conta *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Banco BPI - Conta Principal Ordem"
                  value={newDescricao}
                  onChange={(e) => setNewDescricao(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Saldo Contabilístico (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSaldoContabilistico}
                    onChange={(e) => setNewSaldoContabilistico(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Saldo Conferido (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSaldoConferido}
                    onChange={(e) => setNewSaldoConferido(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Documento de Suporte
                </label>
                <input
                  type="text"
                  placeholder="Ex: Extrato Bancário BPI a 31/12/2026"
                  value={newDocumento}
                  onChange={(e) => setNewDocumento(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={newObservacoes}
                  onChange={(e) => setNewObservacoes(e.target.value)}
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
                  Adicionar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
