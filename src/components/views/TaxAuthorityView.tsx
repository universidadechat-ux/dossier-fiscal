import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UNCONFIRMED_DEADLINE } from '../../utils/taxSafety';
import { TaxObligationItem } from '../../types';
import {
  FileText,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const TaxAuthorityView: React.FC = () => {
  const {
    exerciseData,
    updateTaxObligation,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [editingItem, setEditingItem] = useState<TaxObligationItem | null>(null);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateTaxObligation(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const getStatusBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Validado':
      case 'Submetido':
        return 'bg-emerald-100 text-emerald-800';
      case 'Preparado':
        return 'bg-blue-100 text-blue-800';
      case 'Por submeter':
        return 'bg-amber-100 text-amber-800';
      case 'Necessita correção':
        return 'bg-rose-100 text-rose-800';
      case 'Por preparar':
      default:
        return 'bg-slate-100 text-slate-700';
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
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Autoridade Tributária (AT) & Obrigações Declarativas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralização de declarações oficiais (Modelo 22, IES / DA, IVA, Inventários), certidões e comprovativos de entrega.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Salvaguarda de Prazos Legais em vigor</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Obrigação / Declaração</th>
                <th className="px-4 py-3">Período de Referência</th>
                <th className="px-4 py-3">Prazo Legal de Submissão</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Comprovativo de Entrega</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.taxObligations.map((obl) => {
                const isUnconfirmedDeadline =
                  obl.prazoStatus === 'por_confirmar' || obl.prazo === UNCONFIRMED_DEADLINE;

                return (
                  <tr key={obl.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{obl.descricao}</div>
                      {obl.observacoes && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{obl.observacoes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{obl.periodo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isUnconfirmedDeadline ? (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {UNCONFIRMED_DEADLINE}
                        </span>
                      ) : (
                        <span className="font-mono font-medium text-slate-900">{obl.prazo}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{obl.responsavel}</td>
                    <td className="px-4 py-3">
                      {obl.comprovativo ? (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-medium hover:underline cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{obl.comprovativo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Sem comprovativo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(obl.estado)}`}>
                        {obl.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingItem(obl)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                        title="Atualizar estado ou anexar comprovativo"
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

      {/* Modal Edição de Obrigação */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Atualizar Obrigação — {editingItem.descricao}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado da Obrigação</label>
                  <select
                    value={editingItem.estado}
                    onChange={(e) => setEditingItem({ ...editingItem, estado: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Por preparar">Por preparar</option>
                    <option value="Preparado">Preparado</option>
                    <option value="Por submeter">Por submeter</option>
                    <option value="Submetido">Submetido</option>
                    <option value="Validado">Validado</option>
                    <option value="Necessita correção">Necessita correção</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsável</label>
                  <input
                    type="text"
                    value={editingItem.responsavel}
                    onChange={(e) => setEditingItem({ ...editingItem, responsavel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Comprovativo / Ficheiro</label>
                <input
                  type="text"
                  placeholder="Ex: Comprovativo_Submissao_M22_2026.pdf"
                  value={editingItem.comprovativo}
                  onChange={(e) => setEditingItem({ ...editingItem, comprovativo: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações</label>
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
