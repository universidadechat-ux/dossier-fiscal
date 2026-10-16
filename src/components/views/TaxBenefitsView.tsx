import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { TaxBenefitItem } from '../../types';
import {
  Coins,
  Plus,
  Trash2,
  Edit2,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const TaxBenefitsView: React.FC = () => {
  const {
    exerciseData,
    updateTaxBenefit,
    addTaxBenefit,
    deleteTaxBenefit,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [editingItem, setEditingItem] = useState<TaxBenefitItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Totais
  const totalPotencial = exerciseData.taxBenefits.reduce((sum, b) => sum + b.beneficioPotencial, 0);
  const totalUtilizado = exerciseData.taxBenefits.reduce((sum, b) => sum + b.beneficioUtilizado, 0);
  const totalSaldoDisponivel = exerciseData.taxBenefits.reduce((sum, b) => sum + b.saldoDisponivel, 0);

  const [newItem, setNewItem] = useState<Partial<TaxBenefitItem>>({
    nome: '',
    descricao: '',
    legislacaoAplicavel: 'Código Fiscal do Investimento',
    periodo: `Exercício ${currentYear}`,
    investimentoElegivel: 0,
    beneficioPotencial: 0,
    beneficioUtilizado: 0,
    limite: 0,
    saldoDisponivel: 0,
    documentoSuporte: '',
    observacoes: '',
    estado: 'Em análise',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.nome || !newItem.beneficioPotencial) {
      showToast('Preencha os campos obrigatórios do benefício.', 'error');
      return;
    }

    const potencial = Number(newItem.beneficioPotencial) || 0;
    const utilizado = Number(newItem.beneficioUtilizado) || 0;
    const saldo = Math.max(0, potencial - utilizado);

    addTaxBenefit({
      nome: newItem.nome,
      descricao: newItem.descricao || '',
      legislacaoAplicavel: newItem.legislacaoAplicavel || 'CFI',
      periodo: newItem.periodo || `Exercício ${currentYear}`,
      investimentoElegivel: Number(newItem.investimentoElegivel) || 0,
      beneficioPotencial: potencial,
      beneficioUtilizado: utilizado,
      limite: Number(newItem.limite) || 0,
      saldoDisponivel: saldo,
      documentoSuporte: newItem.documentoSuporte || '',
      observacoes: newItem.observacoes || '',
      estado: newItem.estado as any || 'Em análise',
      responsavel: newItem.responsavel || 'Contabilista',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const potencial = Number(editingItem.beneficioPotencial) || 0;
    const utilizado = Number(editingItem.beneficioUtilizado) || 0;
    const saldo = Math.max(0, potencial - utilizado);
    updateTaxBenefit(editingItem.id, {
      ...editingItem,
      saldoDisponivel: saldo,
    });
    setEditingItem(null);
  };

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar o benefício "${nome}"?`)) {
      deleteTaxBenefit(id);
    }
  };

  const getStatusBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Elegível':
        return 'bg-emerald-100 text-emerald-800';
      case 'Utilizado':
        return 'bg-blue-100 text-blue-800';
      case 'Não elegível':
        return 'bg-rose-100 text-rose-800';
      case 'A rever':
        return 'bg-orange-100 text-orange-800';
      case 'Em análise':
      default:
        return 'bg-amber-100 text-amber-800';
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
            <Coins className="w-5 h-5 text-indigo-600" />
            <span>Benefícios Fiscais (RFAI, SIFIDE, ICE, DLRR)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controlo rigoroso de elegibilidade, investimentos relevantes e saldos reportáveis. Nunca assumir elegibilidade sem comprovação formal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Benefício Fiscal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Benefício Potencial Apurado
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalPotencial)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Deduções fiscais elegíveis</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Benefício Utilizado em {currentYear}
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(totalUtilizado)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Deduzido à coleta de IRC</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Saldo Disponível para Reporte
          </span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            {formatCurrency(totalSaldoDisponivel)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Reportável por exercícios futuros</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Incentivo / Benefício</th>
                <th className="px-4 py-3">Legislação Aplicável</th>
                <th className="px-4 py-3 text-right">Investimento Elegível</th>
                <th className="px-4 py-3 text-right">Benefício Potencial</th>
                <th className="px-4 py-3 text-right">Utilizado {currentYear}</th>
                <th className="px-4 py-3 text-right">Saldo Disponível</th>
                <th className="px-4 py-3 text-center">Estado Elegibilidade</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.taxBenefits.map((ben) => (
                <tr key={ben.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{ben.nome}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{ben.descricao}</div>
                    {ben.documentoSuporte && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3" />
                        <span>{ben.documentoSuporte}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                      {ben.legislacaoAplicavel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                    {formatCurrency(ben.investimentoElegivel)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(ben.beneficioPotencial)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 tabular-nums">
                    {formatCurrency(ben.beneficioUtilizado)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700 tabular-nums">
                    {formatCurrency(ben.saldoDisponivel)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(ben.estado)}`}>
                      {ben.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingItem(ben)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ben.id, ben.nome)}
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
              <h3 className="text-sm font-bold text-slate-900">Registar Benefício Fiscal</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Benefício *</label>
                <input
                  type="text"
                  placeholder="Ex: RFAI - Regime Fiscal de Apoio ao Investimento"
                  value={newItem.nome}
                  onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Legislação Aplicável</label>
                <input
                  type="text"
                  placeholder="Ex: Art. 22.º do Código Fiscal do Investimento"
                  value={newItem.legislacaoAplicavel}
                  onChange={(e) => setNewItem({ ...newItem, legislacaoAplicavel: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Investimento Elegível (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.investimentoElegivel}
                    onChange={(e) => setNewItem({ ...newItem, investimentoElegivel: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Benefício Potencial (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.beneficioPotencial}
                    onChange={(e) => setNewItem({ ...newItem, beneficioPotencial: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Utilizado em {currentYear} (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.beneficioUtilizado}
                    onChange={(e) => setNewItem({ ...newItem, beneficioUtilizado: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de Elegibilidade</label>
                  <select
                    value={newItem.estado}
                    onChange={(e) => setNewItem({ ...newItem, estado: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Em análise">Em análise</option>
                    <option value="Elegível">Elegível</option>
                    <option value="Utilizado">Utilizado</option>
                    <option value="A rever">A rever</option>
                    <option value="Não elegível">Não elegível</option>
                  </select>
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
                  Registar Benefício
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
