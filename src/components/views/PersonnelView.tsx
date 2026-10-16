import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
import { UserCheck, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export const PersonnelView: React.FC = () => {
  const { exerciseData, currentYear } = useApp();

  const totalProcessado = exerciseData.personnel.reduce((sum, p) => sum + p.valorProcessado, 0);
  const totalContabilizado = exerciseData.personnel.reduce((sum, p) => sum + p.valorContabilizado, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            1. Encerramento Contabilístico
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>Pessoal & Encargos Sociais (Contas 63, 23 e 24.5)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conferência anual de remunerações, acréscimos de férias e subsídios, TSU (23,75% patronal / 11% trabalhador) e retenções de IRS com as DMR.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Processado no ERP de Salários
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalProcessado)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Remunerações brutas + encargos sociais</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Registado na Contabilidade Geral
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(totalContabilizado)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Reconciliado 100% com o balancete analítico</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Rubrica de Pessoal</th>
                <th className="px-4 py-3">Descrição dos Encargos</th>
                <th className="px-4 py-3">Conta SNC</th>
                <th className="px-4 py-3 text-right">Valor Processado</th>
                <th className="px-4 py-3 text-right">Valor Contabilizado</th>
                <th className="px-4 py-3 text-right">Diferença</th>
                <th className="px-4 py-3">Documento de Suporte</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.personnel.map((p) => {
                const badge = getStatusBadge(p.estado);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 capitalize">
                      {p.rubrica.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{p.descricao}</div>
                      {p.observacoes && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{p.observacoes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{p.contaContabilistica}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900 tabular-nums">
                      {formatCurrency(p.valorProcessado)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(p.valorContabilizado)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      {formatCurrency(p.diferenca)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[180px]">{p.documentoSuporte}</span>
                      </div>
                    </td>
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
