import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusBadge } from '../../utils/formatters';
import { CheckSquare, AlertCircle, ArrowUpDown, Filter, ArrowRight } from 'lucide-react';

interface UnifiedPendingItem {
  id: string;
  tipo:
    | 'documento_falta'
    | 'conta_diferenca'
    | 'reconciliacao_banco'
    | 'questao_pendente'
    | 'calculo_irc'
    | 'declaracao_at'
    | 'lancamento_acrescimo'
    | 'tarefa_geral';
  titulo: string;
  area: string;
  prioridade: 'alta' | 'media' | 'baixa';
  responsavel: string;
  dataLimite: string;
  estado: string;
  targetView: string;
}

export const PendingTasksView: React.FC = () => {
  const { exerciseData, currentYear, currentCompany, setActiveView } = useApp();

  const [sortBy, setSortBy] = useState<'prioridade' | 'area' | 'responsavel' | 'dataLimite' | 'estado'>('prioridade');
  const [filterType, setFilterType] = useState<string>('todos');

  // Agrupamento automático de todos os pendentes de todas as áreas (Secção 23)
  const unifiedItems: UnifiedPendingItem[] = useMemo(() => {
    const list: UnifiedPendingItem[] = [];

    // 1. Contas com diferenças
    exerciseData.accounts
      .filter((a) => Math.abs(a.diferenca) > 0.01)
      .forEach((a) => {
        list.push({
          id: `pend-acc-${a.id}`,
          tipo: 'conta_diferenca',
          titulo: `Conta ${a.codigoConta} (${a.descricao}) com diferença de ${a.diferenca} €`,
          area: 'Conferência de Contas',
          prioridade: 'alta',
          responsavel: a.responsavel,
          dataLimite: '15/01/' + currentYear,
          estado: a.estado,
          targetView: 'conferencia_contas',
        });
      });

    // 2. Reconciliações bancárias pendentes
    exerciseData.banks
      .filter((b) => !b.reconciliacaoConcluida)
      .forEach((b) => {
        list.push({
          id: `pend-bank-${b.id}`,
          tipo: 'reconciliacao_banco',
          titulo: `Reconciliação pendente no ${b.banco} (desvio de ${b.diferenca} €)`,
          area: 'Bancos e Financiamentos',
          prioridade: 'alta',
          responsavel: b.responsavel,
          dataLimite: '15/01/' + currentYear,
          estado: 'em_curso',
          targetView: 'bancos',
        });
      });

    // 3. Acréscimos por lançar
    exerciseData.accruals
      .filter((a) => !a.lancamentoEfetuado)
      .forEach((a) => {
        list.push({
          id: `pend-acr-${a.id}`,
          tipo: 'lancamento_acrescimo',
          titulo: `Lançamento em falta de ${a.tipo}: ${a.descricao} (${a.valor} €)`,
          area: 'Acréscimos e Diferimentos',
          prioridade: 'alta',
          responsavel: a.responsavel,
          dataLimite: '20/01/' + currentYear,
          estado: a.estado,
          targetView: 'acrescimos',
        });
      });

    // 4. Questões fiscais abertas
    exerciseData.questions
      .filter((q) => q.estado !== 'resolvido')
      .forEach((q) => {
        list.push({
          id: `pend-q-${q.id}`,
          tipo: 'questao_pendente',
          titulo: q.questao,
          area: q.area,
          prioridade: q.prioridade,
          responsavel: q.responsavel,
          dataLimite: '25/01/' + currentYear,
          estado: q.estado,
          targetView: 'questoes',
        });
      });

    // 5. Tarefas da checklist em aberto
    exerciseData.tasks
      .filter((t) => t.estado !== 'concluido')
      .forEach((t) => {
        list.push({
          id: `pend-tsk-${t.id}`,
          tipo: 'tarefa_geral',
          titulo: t.descricao,
          area: t.area,
          prioridade: t.prioridade,
          responsavel: t.responsavel,
          dataLimite: t.dataLimite,
          estado: t.estado,
          targetView: 'dossier_checklist',
        });
      });

    // 6. Cálculo de IRC se provisório
    if (exerciseData.ircCalculation.estado !== 'concluido') {
      list.push({
        id: 'pend-irc',
        tipo: 'calculo_irc',
        titulo: 'Validação final do cálculo de IRC e Quadro 07 da Modelo 22',
        area: 'Cálculo IRC',
        prioridade: 'alta',
        responsavel: exerciseData.ircCalculation.responsavel,
        dataLimite: '31/01/' + currentYear,
        estado: 'em_curso',
        targetView: 'calculo_irc',
      });
    }

    return list;
  }, [exerciseData, currentYear]);

  // Ordenação
  const sortedItems = useMemo(() => {
    return [...unifiedItems].sort((a, b) => {
      if (sortBy === 'prioridade') {
        const order = { alta: 1, media: 2, baixa: 3 };
        return order[a.prioridade] - order[b.prioridade];
      }
      if (sortBy === 'area') {
        return a.area.localeCompare(b.area);
      }
      if (sortBy === 'responsavel') {
        return a.responsavel.localeCompare(b.responsavel);
      }
      if (sortBy === 'estado') {
        return a.estado.localeCompare(b.estado);
      }
      return a.dataLimite.localeCompare(b.dataLimite);
    });
  }, [unifiedItems, sortBy]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Controlo & Revisão
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>Pendentes para o Encerramento</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visão consolidada de todas as contas por regularizar, reconciliações em falta, documentos por anexar e cálculos pendentes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:outline-none"
          >
            <option value="prioridade">Prioridade (Alta primeiro)</option>
            <option value="area">Área de Trabalho</option>
            <option value="responsavel">Responsável</option>
            <option value="dataLimite">Data Limite</option>
            <option value="estado">Estado</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total de Itens Pendentes
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {unifiedItems.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Aguardam resolução</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">
            Prioridade Alta (Críticos)
          </span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {unifiedItems.filter((i) => i.prioridade === 'alta').length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Diferenças e cálculos</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">
            Prioridade Média
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {unifiedItems.filter((i) => i.prioridade === 'media').length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Dúvidas e circularizações</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Prioridade Baixa
          </span>
          <div className="text-2xl font-bold font-mono text-slate-700 mt-1">
            {unifiedItems.filter((i) => i.prioridade === 'baixa').length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tarefas de arquivo</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Assunto Pendente</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3 text-center">Prioridade</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Prazo</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800 block">{item.titulo}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.area}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.prioridade === 'alta'
                          ? 'bg-rose-100 text-rose-800'
                          : item.prioridade === 'media'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.prioridade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{item.responsavel}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                    {item.dataLimite}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveView(item.targetView)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
