import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { BankItem } from '../../types';
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CreditCard,
} from 'lucide-react';

export const BanksView: React.FC = () => {
  const { exerciseData, updateBank, currentYear, currentCompany, showToast } = useApp();
  const [editingItem, setEditingItem] = useState<BankItem | null>(null);

  const totalSaldoContabilistico = exerciseData.banks.reduce(
    (sum, b) => sum + b.saldoContabilistico,
    0
  );
  const totalSaldoBancario = exerciseData.banks.reduce((sum, b) => sum + b.saldoBancario, 0);
  const totalDiferenca = Number((totalSaldoContabilistico - totalSaldoBancario).toFixed(2));

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateBank(editingItem.id, editingItem);
    setEditingItem(null);
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
            <Landmark className="w-5 h-5 text-indigo-600" />
            <span>Bancos & Financiamentos (Reconciliação Bancária)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conferência dos saldos contabilísticos com os extratos bancários a 31 de dezembro e controlo de empréstimos e leasing.
          </p>
        </div>
      </div>

      {/* KPI Cards: Saldo Contabilístico vs Saldo Bancário -> Diferença */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Saldo Contabilístico Total
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalSaldoContabilistico)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Contas 12 e 25</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Saldo Bancário (Extratos a 31/12)
          </span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            {formatCurrency(totalSaldoBancario)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Posição financeira real</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Diferença Global por Justificar
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 tabular-nums ${
              Math.abs(totalDiferenca) > 0.01 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(totalDiferenca)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {Math.abs(totalDiferenca) > 0.01 ? 'Regularizações pendentes' : 'Reconciliação fechada'}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Instituição Financeira</th>
                <th className="px-4 py-3">Tipo Conta</th>
                <th className="px-4 py-3">Conta SNC</th>
                <th className="px-4 py-3 text-right">Saldo Contabilístico</th>
                <th className="px-4 py-3 text-right">Saldo Bancário</th>
                <th className="px-4 py-3 text-right">Diferença</th>
                <th className="px-4 py-3">Extrato Anexo</th>
                <th className="px-4 py-3 text-center">Estado Reconciliação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.banks.map((b) => {
                const hasDiff = Math.abs(b.diferenca) > 0.01;
                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      hasDiff ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{b.banco}</span>
                      {b.observacoes && (
                        <span className="text-[11px] text-slate-500 block mt-0.5">{b.observacoes}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.tipoConta}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{b.contaContabilistica}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900 tabular-nums font-semibold">
                      {formatCurrency(b.saldoContabilistico)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900 tabular-nums font-semibold">
                      {formatCurrency(b.saldoBancario)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-bold tabular-nums ${
                        hasDiff ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {formatCurrency(b.diferenca)}
                    </td>
                    <td className="px-4 py-3">
                      {b.extratoAssociado ? (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-medium truncate max-w-[160px]">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{b.extratoAssociado}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pendente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                          b.reconciliacaoConcluida
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.reconciliacaoConcluida ? 'Reconciliado' : 'Com Diferença'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingItem(b)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
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
              <h3 className="text-sm font-bold text-slate-900">
                Editar Reconciliação — {editingItem.banco}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Saldo Contabilístico (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.saldoContabilistico}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        saldoContabilistico: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Saldo Bancário (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.saldoBancario}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        saldoBancario: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Extrato Associado</label>
                <input
                  type="text"
                  value={editingItem.extratoAssociado}
                  onChange={(e) => setEditingItem({ ...editingItem, extratoAssociado: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.reconciliacaoConcluida}
                    onChange={(e) => setEditingItem({ ...editingItem, reconciliacaoConcluida: e.target.checked })}
                    className="rounded text-slate-900 focus:ring-0"
                  />
                  <span>Reconciliação Bancária Concluída e Validada</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações e Explicação de Diferenças</label>
                <textarea
                  rows={2}
                  value={editingItem.observacoes}
                  onChange={(e) => setEditingItem({ ...editingItem, observacoes: e.target.value })}
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
    </div>
  );
};
