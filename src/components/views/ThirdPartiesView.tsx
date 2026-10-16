import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatNIF, getStatusBadge } from '../../utils/formatters';
import { ThirdPartyAnomaly } from '../../types';
import {
  Users2,
  AlertTriangle,
  Send,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const ThirdPartiesView: React.FC = () => {
  const { exerciseData, updateThirdParty, currentYear, currentCompany, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'todos' | 'clientes' | 'fornecedores'>('todos');

  const filteredItems = exerciseData.thirdParties.filter((tp) => {
    if (activeTab === 'clientes') return tp.tipo === 'cliente';
    if (activeTab === 'fornecedores') return tp.tipo === 'fornecedor';
    return true;
  });

  const getAnomalyLabel = (tipo: string) => {
    switch (tipo) {
      case 'saldo_credor_cliente':
        return { label: 'Saldo Credor Anormal em Cliente', class: 'bg-rose-100 text-rose-800' };
      case 'saldo_devedor_fornecedor':
        return { label: 'Saldo Devedor Anormal em Fornecedor', class: 'bg-amber-100 text-amber-800' };
      case 'antigo_mais_180_dias':
        return { label: 'Pendente há mais de 180 dias', class: 'bg-orange-100 text-orange-800' };
      case 'sem_movimento':
        return { label: 'Conta sem Movimento no Exercício', class: 'bg-slate-100 text-slate-700' };
      default:
        return { label: 'Confirmação Necessária', class: 'bg-blue-100 text-blue-800' };
    }
  };

  const toggleCircularizacao = (id: string, field: 'circularizacaoEnviada' | 'circularizacaoRecebida') => {
    const item = exerciseData.thirdParties.find((t) => t.id === id);
    if (!item) return;
    updateThirdParty(id, { [field]: !item[field] });
    showToast('Estado de circularização atualizado.');
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
            <Users2 className="w-5 h-5 text-indigo-600" />
            <span>Clientes & Fornecedores (Análise de Saldos e Circularização)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deteção de anomalias contabilísticas: saldos credores em clientes, devedores em fornecedores, mora superior a 180 dias e confirmações de saldo.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
            {exerciseData.thirdParties.filter((t) => t.tipoAnomalia.includes('saldo_credor') || t.tipoAnomalia.includes('saldo_devedor')).length} Saldos Anormais
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'todos', label: `Todos os Alertas (${exerciseData.thirdParties.length})` },
          { id: 'clientes', label: 'Clientes (Contas 21)' },
          { id: 'fornecedores', label: 'Fornecedores (Contas 22)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
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
                <th className="px-4 py-3">Entidade Terceira</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Conta SNC</th>
                <th className="px-4 py-3 text-right">Saldo em Aberto</th>
                <th className="px-4 py-3">Tipo de Anomalia</th>
                <th className="px-4 py-3 text-center">Antiguidade</th>
                <th className="px-4 py-3 text-center">Circularização</th>
                <th className="px-4 py-3">Observações / Reclassificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((tp) => {
                const anom = getAnomalyLabel(tp.tipoAnomalia);
                return (
                  <tr key={tp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{tp.entidade}</span>
                      <span className="text-[11px] text-slate-400 font-mono">NIF: {formatNIF(tp.nif)}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">{tp.tipo}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{tp.contaContabilistica}</td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-bold tabular-nums ${
                        tp.saldo < 0 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(tp.saldo)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${anom.class}`}>
                        {anom.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-600">
                      {tp.diasAberto} dias
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleCircularizacao(tp.id, 'circularizacaoEnviada')}
                          className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                            tp.circularizacaoEnviada ? 'bg-indigo-100 text-indigo-800 font-bold' : 'bg-slate-100 text-slate-400'
                          }`}
                          title="Alternar envio de circularização"
                        >
                          {tp.circularizacaoEnviada ? 'Enviada' : 'Não enviada'}
                        </button>
                        <button
                          onClick={() => toggleCircularizacao(tp.id, 'circularizacaoRecebida')}
                          className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                            tp.circularizacaoRecebida ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'
                          }`}
                          title="Alternar receção de resposta"
                        >
                          {tp.circularizacaoRecebida ? 'Respondida' : 'Pendente'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs text-[11px]">
                      {tp.observacoes}
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
