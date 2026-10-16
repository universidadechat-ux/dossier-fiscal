import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatNIF, getStatusBadge } from '../../utils/formatters';
import { RelatedPartyItem } from '../../types';
import { Layers, Plus, Trash2, Edit2, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export const RelatedPartiesView: React.FC = () => {
  const {
    exerciseData,
    updateRelatedParty,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const totalOperacoes = exerciseData.relatedParties.reduce((sum, r) => sum + r.valor, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            2. Encerramento Fiscal
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Partes Relacionadas & Preços de Transferência (Art. 63.º CIRC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Identificação de operações com entidades relacionadas, conformidade com o princípio de plena concorrência (arm's length) e obrigatoriedade de dossier de preços de transferência.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Volume de Operações com Partes Relacionadas
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalOperacoes)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Exercício {currentYear}</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Dossier de Preços de Transferência
          </span>
          <div className="text-sm font-bold text-indigo-700 mt-1">
            Obrigatório (Vendas & Prestação &gt; 10M € ou transações relevantes)
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Art. 63.º, n.º 6 do CIRC</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Entidade Relacionada</th>
                <th className="px-4 py-3">Tipo de Relação</th>
                <th className="px-4 py-3">Natureza da Operação</th>
                <th className="px-4 py-3 text-right">Valor Operação</th>
                <th className="px-4 py-3 text-right">Saldo em Aberto</th>
                <th className="px-4 py-3 text-center">Análise Fiscal</th>
                <th className="px-4 py-3">Documentação / Contratos</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.relatedParties.map((rp) => {
                const badge = getStatusBadge(rp.estado);
                return (
                  <tr key={rp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{rp.entidade}</span>
                      <span className="text-[11px] text-slate-400 font-mono">NIF: {formatNIF(rp.nif)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{rp.tipoRelacao}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs">{rp.operacao}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(rp.valor)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 tabular-nums">
                      {formatCurrency(rp.saldo)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        {rp.analiseFiscalNecessaria ? 'Requer Análise' : 'Dispensada'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{rp.documentacao}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badge.bgClass} ${badge.textClass}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
