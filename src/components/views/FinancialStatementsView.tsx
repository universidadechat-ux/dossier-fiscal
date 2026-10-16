import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialStatementItem } from '../../types';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  FileText,
  Edit2,
  Calendar,
  UserCheck,
} from 'lucide-react';

export const FinancialStatementsView: React.FC = () => {
  const {
    exerciseData,
    updateFinancialStatement,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [editingItem, setEditingItem] = useState<FinancialStatementItem | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateFinancialStatement(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const toggleStatus = (item: FinancialStatementItem, field: 'preparado' | 'revisto' | 'aprovado') => {
    updateFinancialStatement(item.id, {
      [field]: !item[field],
      data: item.data || new Date().toLocaleDateString('pt-PT'),
    });
  };

  const totalPreparado = exerciseData.financialStatements.filter((f) => f.preparado).length;
  const totalRevisto = exerciseData.financialStatements.filter((f) => f.revisto).length;
  const totalAprovado = exerciseData.financialStatements.filter((f) => f.aprovado).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            3. Dossier Fiscal
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Demonstrações Financeiras (NCRF / SNC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controlo de preparação, revisão e aprovação das peças contabilísticas obrigatórias do exercício.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
            Preparadas: {totalPreparado}/{exerciseData.financialStatements.length}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
            Revistas: {totalRevisto}/{exerciseData.financialStatements.length}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Peça Contabilística</th>
                <th className="px-4 py-3 text-center">Preparado</th>
                <th className="px-4 py-3 text-center">Revisto</th>
                <th className="px-4 py-3 text-center">Aprovado</th>
                <th className="px-4 py-3">Documento Associado</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.financialStatements.map((fs) => (
                <tr key={fs.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800 block">{fs.nome}</span>
                    {fs.observacoes && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">{fs.observacoes}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(fs, 'preparado')}
                      className={`p-1 rounded cursor-pointer ${
                        fs.preparado ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'
                      }`}
                      title="Alternar estado de preparação"
                    >
                      <CheckCircle2 className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(fs, 'revisto')}
                      className={`p-1 rounded cursor-pointer ${
                        fs.revisto ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-300 hover:bg-slate-100'
                      }`}
                      title="Alternar estado de revisão"
                    >
                      <CheckCircle2 className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(fs, 'aprovado')}
                      className={`p-1 rounded cursor-pointer ${
                        fs.aprovado ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'
                      }`}
                      title="Alternar estado de aprovação"
                    >
                      <CheckCircle2 className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {fs.documentoAssociado ? (
                      <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{fs.documentoAssociado}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Por anexar</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fs.data || '—'}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fs.responsavel}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditingItem(fs)}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
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
                Editar Peça — {editingItem.nome}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ficheiro / Documento Associado</label>
                <input
                  type="text"
                  placeholder="Ex: Balanco_Final_2026.pdf"
                  value={editingItem.documentoAssociado}
                  onChange={(e) => setEditingItem({ ...editingItem, documentoAssociado: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="text"
                    value={editingItem.data}
                    onChange={(e) => setEditingItem({ ...editingItem, data: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
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
                <label className="block font-semibold text-slate-700 mb-1">Observações e Notas</label>
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
