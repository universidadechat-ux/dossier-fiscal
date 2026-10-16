import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { GitCompare, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MetricComparison {
  rubrica: string;
  anoAnterior: number;
  anoAtual: number;
}

export const ComparisonView: React.FC = () => {
  const { currentCompany, currentYear, exerciseData } = useApp();

  // Dados consolidados do exercício de 2026
  const raiAtual = exerciseData.ircCalculation.resultadoContabilisticoAntesImpostos;
  const taxaIrc = exerciseData.ircCalculation.taxaIrc;
  const ircAtual = raiAtual * taxaIrc;
  const taAtual = exerciseData.autonomousTaxes.reduce((sum, t) => sum + (t.valorTA || 0), 0);
  const invAtual = exerciseData.inventory.valorFinal;
  const clientesAtual = exerciseData.accounts
    .filter((a) => a.codigoConta.startsWith('21'))
    .reduce((sum, a) => sum + a.saldoContabilistico, 0);
  const fornecedoresAtual = exerciseData.accounts
    .filter((a) => a.codigoConta.startsWith('22'))
    .reduce((sum, a) => sum + a.saldoContabilistico, 0);
  const ativosAtual = exerciseData.assets.reduce((sum, a) => sum + a.valorLiquido, 0);
  const financiamentosAtual = exerciseData.banks
    .filter((b) => b.tipoConta === 'Financiamento')
    .reduce((sum, b) => sum + Math.abs(b.saldoContabilistico), 0);
  const acrescimosAtual = exerciseData.accruals
    .filter((a) => a.tipo === 'acrescimo')
    .reduce((sum, a) => sum + a.valor, 0);
  const diferimentosAtual = exerciseData.accruals
    .filter((a) => a.tipo === 'diferimento')
    .reduce((sum, a) => sum + a.valor, 0);
  const imparidadesAtual = exerciseData.impairments.reduce(
    (sum, i) => sum + i.imparidadeContabilizada,
    0
  );

  // Dados de referência histórica de 2025
  const metrics: MetricComparison[] = [
    { rubrica: 'Volume de Negócios (Vendas e Serviços - Classe 7)', anoAnterior: 980500.0, anoAtual: 1145200.0 },
    { rubrica: 'Resultado Contabilístico antes de Impostos (RAI)', anoAnterior: 142100.0, anoAtual: raiAtual },
    { rubrica: 'Resultado Fiscal (Lucro Tributável Estimado)', anoAnterior: 138400.0, anoAtual: raiAtual + 1250 - 6500 },
    { rubrica: 'Coleta de IRC Estimada', anoAnterior: 29841.0, anoAtual: ircAtual },
    { rubrica: 'Tributações Autónomas (Art. 88.º CIRC)', anoAnterior: 1820.0, anoAtual: taAtual },
    { rubrica: 'Inventários Finais (Mercadorias e Materiais)', anoAnterior: 54200.0, anoAtual: invAtual },
    { rubrica: 'Clientes c/c (Saldos em Aberto)', anoAnterior: 285400.0, anoAtual: clientesAtual },
    { rubrica: 'Fornecedores c/c (Saldos em Aberto)', anoAnterior: 172300.0, anoAtual: fornecedoresAtual },
    { rubrica: 'Ativos Tangíveis e Intangíveis (Valor Líquido)', anoAnterior: 135000.0, anoAtual: ativosAtual },
    { rubrica: 'Financiamentos Obtidos (Dívida Bancária)', anoAnterior: 116400.0, anoAtual: financiamentosAtual },
    { rubrica: 'Acréscimos de Gastos (Férias e Encargos)', anoAnterior: 39500.0, anoAtual: acrescimosAtual },
    { rubrica: 'Diferimentos de Gastos (Seguros e Rendas)', anoAnterior: 18400.0, anoAtual: diferimentosAtual },
    { rubrica: 'Perdas por Imparidade Acumuladas', anoAnterior: 6500.0, anoAtual: imparidadesAtual },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Exercícios Anteriores
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <span>Comparação de Exercícios — 2025 vs {currentYear}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Análise evolutiva de grandes agregados contabilísticos e fiscais. Identificação e destaque de variações materiais (&gt; 10%).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Variações superiores a 10% sinalizadas para revisão técnica</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Rubrica Contabilística / Fiscal</th>
                <th className="px-4 py-3 text-right">Exercício 2025</th>
                <th className="px-4 py-3 text-right font-bold text-slate-900">Exercício {currentYear}</th>
                <th className="px-4 py-3 text-right">Variação (€)</th>
                <th className="px-4 py-3 text-right">Variação (%)</th>
                <th className="px-4 py-3 text-center">Materialidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.map((m, idx) => {
                const difEuros = m.anoAtual - m.anoAnterior;
                const difPerc = m.anoAnterior !== 0 ? (difEuros / m.anoAnterior) * 100 : 0;
                const isSignificativa = Math.abs(difPerc) >= 10;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSignificativa ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800">{m.rubrica}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                      {formatCurrency(m.anoAnterior)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(m.anoAtual)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-semibold tabular-nums ${
                        difEuros > 0 ? 'text-emerald-700' : difEuros < 0 ? 'text-rose-700' : 'text-slate-500'
                      }`}
                    >
                      {difEuros > 0 ? `+${formatCurrency(difEuros)}` : formatCurrency(difEuros)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-bold tabular-nums ${
                        difPerc > 0 ? 'text-emerald-700' : difPerc < 0 ? 'text-rose-700' : 'text-slate-500'
                      }`}
                    >
                      {difPerc > 0 ? `+${formatPercent(difPerc)}` : formatPercent(difPerc)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {isSignificativa ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Variação &gt; 10%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium">
                          Normal
                        </span>
                      )}
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
