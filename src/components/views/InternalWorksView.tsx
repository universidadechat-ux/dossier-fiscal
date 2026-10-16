import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
import { InternalWorkItem } from '../../types';
import { Wrench, Plus, Edit2, Trash2, FileText, CheckCircle2 } from 'lucide-react';

export const InternalWorksView: React.FC = () => {
  const {
    exerciseData,
    updateInternalWork,
    addInternalWork,
    deleteInternalWork,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const totalTrabalhos = exerciseData.internalWorks.reduce((sum, w) => sum + w.valorTotal, 0);

  const [newItem, setNewItem] = useState<Partial<InternalWorkItem>>({
    projeto: '',
    descricao: '',
    natureza: 'Ativo Intangível em Curso (NCRF 6)',
    periodo: `Exercício ${currentYear}`,
    trabalhadoresEnvolvidos: 'Equipa de Engenharia',
    horas: 100,
    custoMaoObra: 0,
    materiais: 0,
    outrosCustos: 0,
    valorTotal: 0,
    criterioUtilizado: 'Custos diretos de desenvolvimento apurados por timesheets',
    contaContabilistica: '44.3 / 74.2',
    documentacaoJustificativa: '',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    revisao: 'Validado',
    observacoes: '',
    estado: 'concluido',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.projeto) {
      showToast('Preencha o nome do projeto.', 'error');
      return;
    }

    const maoObra = Number(newItem.custoMaoObra) || 0;
    const materiais = Number(newItem.materiais) || 0;
    const outros = Number(newItem.outrosCustos) || 0;
    const total = maoObra + materiais + outros;

    addInternalWork({
      projeto: newItem.projeto,
      descricao: newItem.descricao || '',
      natureza: newItem.natureza || 'Ativo Intangível',
      periodo: newItem.periodo || `Exercício ${currentYear}`,
      trabalhadoresEnvolvidos: newItem.trabalhadoresEnvolvidos || '',
      horas: Number(newItem.horas) || 0,
      custoMaoObra: maoObra,
      materiais,
      outrosCustos: outros,
      valorTotal: total,
      criterioUtilizado: newItem.criterioUtilizado || '',
      contaContabilistica: newItem.contaContabilistica || '74',
      documentacaoJustificativa: newItem.documentacaoJustificativa || '',
      responsavel: newItem.responsavel || 'Contabilista',
      revisao: newItem.revisao || '',
      observacoes: newItem.observacoes || '',
      estado: newItem.estado as any || 'concluido',
    });

    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, proj: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar o trabalho interno "${proj}"?`)) {
      deleteInternalWork(id);
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
            <Wrench className="w-5 h-5 text-indigo-600" />
            <span>Trabalhos para a Própria Empresa (Conta 74 / NCRF 6 & 7)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capitalização de gastos internos de produção e desenvolvimento de ativos fixos tangíveis ou intangíveis.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Trabalho Interno</span>
        </button>
      </div>

      {/* KPI Card */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs max-w-md">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Total Capitalizado no Exercício (Conta 74)
        </span>
        <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
          {formatCurrency(totalTrabalhos)}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">
          Rendimento por trabalhos para a própria entidade (NCRF 6/7)
        </span>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Projeto / Ativo em Curso</th>
                <th className="px-4 py-3">Natureza</th>
                <th className="px-4 py-3 text-center">Horas</th>
                <th className="px-4 py-3 text-right">Mão de Obra</th>
                <th className="px-4 py-3 text-right">Materiais</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3">Conta SNC</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.internalWorks.map((w) => {
                const badge = getStatusBadge(w.estado);
                return (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{w.projeto}</div>
                      <div className="text-[11px] text-slate-500">{w.descricao}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{w.natureza}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                      {w.horas}h
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {formatCurrency(w.custoMaoObra)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {formatCurrency(w.materiais)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(w.valorTotal)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{w.contaContabilistica}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badge.bgClass} ${badge.textClass}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(w.id, w.projeto)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
              <h3 className="text-sm font-bold text-slate-900">Registar Trabalho Interno</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Projeto *</label>
                <input
                  type="text"
                  placeholder="Ex: Plataforma Interna de Gestão de Faturas"
                  value={newItem.projeto}
                  onChange={(e) => setNewItem({ ...newItem, projeto: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custo Mão de Obra (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.custoMaoObra}
                    onChange={(e) => setNewItem({ ...newItem, custoMaoObra: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Materiais (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.materiais}
                    onChange={(e) => setNewItem({ ...newItem, materiais: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horas Totais</label>
                  <input
                    type="number"
                    value={newItem.horas}
                    onChange={(e) => setNewItem({ ...newItem, horas: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Critério de Imputação (NCRF 6/7)</label>
                <input
                  type="text"
                  value={newItem.criterioUtilizado}
                  onChange={(e) => setNewItem({ ...newItem, criterioUtilizado: e.target.value })}
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
                  Registar Trabalho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
