import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { TaxCorrectionItem } from '../../types';
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const IrcCalculationView: React.FC = () => {
  const {
    exerciseData,
    updateIrcCalculation,
    addTaxCorrection,
    deleteTaxCorrection,
    currentYear,
    currentCompany,
    openAssistant,
    showToast,
  } = useApp();

  const irc = exerciseData.ircCalculation;
  const [isAddCorrectionOpen, setIsAddCorrectionOpen] = useState(false);

  // Cálculos da Ponte Fiscal:
  const rai = irc.resultadoContabilisticoAntesImpostos;

  const correcoesPositivas = irc.correcoes
    .filter((c) => c.tipoCorrecao === 'positiva')
    .reduce((sum, c) => sum + c.correcaoFiscal, 0);

  const correcoesNegativas = irc.correcoes
    .filter((c) => c.tipoCorrecao === 'negativa')
    .reduce((sum, c) => sum + c.correcaoFiscal, 0);

  // Lucro Tributável
  const lucroTributavel = Math.max(0, rai + correcoesPositivas - correcoesNegativas);

  // Matéria Coletável
  const materiaColetavel = Math.max(
    0,
    lucroTributavel - irc.prejuizosFiscaisReportaveis - irc.beneficiosFiscaisDedutiveis
  );

  // Coleta de IRC (com escalão PME se aplicável)
  let coletaIrc = 0;
  if (currentCompany.regimeIrc === 'PME' || irc.taxaReduzidaPmeAplicavel) {
    const escalaoReduzido = Math.min(materiaColetavel, irc.limiteTaxaReduzida || 50000);
    const escalaoNormal = Math.max(0, materiaColetavel - escalaoReduzido);
    coletaIrc = escalaoReduzido * 0.17 + escalaoNormal * irc.taxaIrc;
  } else {
    coletaIrc = materiaColetavel * irc.taxaIrc;
  }

  // Derrama Municipal
  const derramaMunicipal = materiaColetavel * (irc.derramaMunicipalTaxa || 0.015);

  // Tributações Autónomas apuradas
  const totalTributacoesAutonomas = exerciseData.autonomousTaxes.reduce(
    (sum, t) => sum + (t.valorTA || 0),
    0
  );

  // Imposto Global Apurado
  const impostoGlobal =
    coletaIrc + derramaMunicipal + irc.derramaEstadual + totalTributacoesAutonomas;

  // Deduções à Coleta (Retenções e PPC)
  const totalDeducoes = irc.retencoesNaFonte + irc.pagamentosPorConta + irc.pagamentoAdicionalPorConta;

  // IRC Estimado (A pagar se positivo, A recuperar se negativo)
  const ircEstimado = Number((impostoGlobal - totalDeducoes).toFixed(2));

  // Form de Nova Correção Fiscal
  const [newCor, setNewCor] = useState<Partial<TaxCorrectionItem>>({
    quadro22Linha: 'Quadro 07 - Campo 713',
    conta: '68',
    descricao: '',
    valorContabilistico: 0,
    correcaoFiscal: 0,
    valorFiscal: 0,
    tipoCorrecao: 'positiva',
    referenciaLegal: 'Código do IRC',
    referenciaValidada: true,
    documento: '',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    observacoes: '',
  });

  const handleCreateCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCor.descricao || !newCor.correcaoFiscal) {
      showToast('Preencha os campos obrigatórios da correção fiscal.', 'error');
      return;
    }

    addTaxCorrection({
      quadro22Linha: newCor.quadro22Linha || 'Quadro 07',
      conta: newCor.conta || '68',
      descricao: newCor.descricao,
      valorContabilistico: Number(newCor.valorContabilistico) || 0,
      correcaoFiscal: Number(newCor.correcaoFiscal) || 0,
      valorFiscal:
        newCor.tipoCorrecao === 'positiva'
          ? (Number(newCor.valorContabilistico) || 0) - (Number(newCor.correcaoFiscal) || 0)
          : (Number(newCor.valorContabilistico) || 0) + (Number(newCor.correcaoFiscal) || 0),
      tipoCorrecao: newCor.tipoCorrecao as 'positiva' | 'negativa',
      referenciaLegal: newCor.referenciaLegal || 'Art. 23.º-A do CIRC',
      referenciaValidada: !!newCor.referenciaValidada,
      documento: newCor.documento || '',
      responsavel: newCor.responsavel || 'Contabilista',
      observacoes: newCor.observacoes || '',
    });

    setIsAddCorrectionOpen(false);
  };

  const handleDeleteCorrection = (id: string, desc: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar a correção fiscal "${desc}"?`)) {
      deleteTaxCorrection(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            2. Encerramento Fiscal
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span>Cálculo de IRC & Ponte Fiscal (Quadro 07 Modelo 22)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconciliação rigorosa entre o Resultado Contabilístico antes de Impostos (RAI) e o Lucro Tributável com deduções legais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAssistant('Explica a ponte de IRC apurada e o valor de derrama.', 'fiscal_bridge')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Explicar com IA</span>
          </button>
          <button
            onClick={() => setIsAddCorrectionOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Correção Fiscal</span>
          </button>
        </div>
      </div>

      {/* PONTE FISCAL INTERATIVA (Secção 12) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Estrutura do Apuramento Fiscal — Exercício {currentYear}
        </h2>

        {/* Linhas da Ponte Contabilística para Fiscal */}
        <div className="space-y-2 text-xs border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
          {/* RAI */}
          <div className="p-3 bg-slate-50 flex items-center justify-between">
            <span className="font-semibold text-slate-800">
              Resultado Contabilístico antes de Impostos (RAI)
            </span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                value={rai}
                onChange={(e) =>
                  updateIrcCalculation({
                    resultadoContabilisticoAntesImpostos: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-36 px-2.5 py-1 bg-white border border-slate-300 rounded font-mono text-right font-bold focus:outline-none"
              />
              <span className="font-mono text-slate-500">€</span>
            </div>
          </div>

          {/* Correções Positivas */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div>
              <span className="font-semibold text-rose-700">
                (+) Correções Fiscais Positivas (Acréscimos ao Lucro Tributável)
              </span>
              <span className="block text-[11px] text-slate-400">
                {irc.correcoes.filter((c) => c.tipoCorrecao === 'positiva').length} itens registados no Quadro 07
              </span>
            </div>
            <span className="font-mono font-bold text-rose-700 text-sm tabular-nums">
              +{formatCurrency(correcoesPositivas)}
            </span>
          </div>

          {/* Correções Negativas */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div>
              <span className="font-semibold text-emerald-700">
                (-) Correções Fiscais Negativas (Deduções ao Lucro Tributável)
              </span>
              <span className="block text-[11px] text-slate-400">
                {irc.correcoes.filter((c) => c.tipoCorrecao === 'negativa').length} itens registados (ex: ICE, mais-valias reinvestidas)
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-700 text-sm tabular-nums">
              -{formatCurrency(correcoesNegativas)}
            </span>
          </div>

          {/* Lucro Tributável */}
          <div className="p-3.5 bg-slate-100/70 flex items-center justify-between font-bold text-slate-900">
            <span>(=) Lucro Tributável / Resultado Fiscal</span>
            <span className="font-mono text-base tabular-nums">{formatCurrency(lucroTributavel)}</span>
          </div>

          {/* Prejuízos Fiscais Reportáveis */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div>
              <span className="text-slate-700">(-) Dedução de Prejuízos Fiscais Reportáveis</span>
              <span className="block text-[11px] text-slate-400">Art. 52.º do CIRC</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={irc.prejuizosFiscaisReportaveis}
              onChange={(e) =>
                updateIrcCalculation({
                  prejuizosFiscaisReportaveis: parseFloat(e.target.value) || 0,
                })
              }
              className="w-36 px-2.5 py-1 bg-white border border-slate-300 rounded font-mono text-right focus:outline-none"
            />
          </div>

          {/* Benefícios Fiscais Dedutíveis */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div>
              <span className="text-slate-700">(-) Benefícios Fiscais Dedutíveis à Matéria Coletável</span>
              <span className="block text-[11px] text-slate-400">RFAI / SIFIDE / Outros incentivos</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={irc.beneficiosFiscaisDedutiveis}
              onChange={(e) =>
                updateIrcCalculation({
                  beneficiosFiscaisDedutiveis: parseFloat(e.target.value) || 0,
                })
              }
              className="w-36 px-2.5 py-1 bg-white border border-slate-300 rounded font-mono text-right focus:outline-none"
            />
          </div>

          {/* Matéria Coletável */}
          <div className="p-3.5 bg-slate-100/70 flex items-center justify-between font-bold text-slate-900">
            <span>(=) Matéria Coletável Final</span>
            <span className="font-mono text-base tabular-nums">{formatCurrency(materiaColetavel)}</span>
          </div>

          {/* Coleta e Taxas */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div>
              <span className="text-slate-700">
                (x) Taxa de IRC {currentCompany.regimeIrc === 'PME' ? '(17% PME até 50k € / 21% restante)' : '(21% Regime Geral)'}
              </span>
              <span className="block text-[11px] text-slate-400">Art. 87.º do CIRC</span>
            </div>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {formatCurrency(coletaIrc)}
            </span>
          </div>

          {/* Derrama Municipal */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div>
              <span className="text-slate-700">
                (+) Derrama Municipal ({(irc.derramaMunicipalTaxa * 100).toFixed(1)}%)
              </span>
              <span className="block text-[11px] text-slate-400">Município sede / estabelecimentos</span>
            </div>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              +{formatCurrency(derramaMunicipal)}
            </span>
          </div>

          {/* Tributações Autónomas */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div>
              <span className="text-slate-700">(+) Tributações Autónomas Apuradas</span>
              <span className="block text-[11px] text-slate-400">Art. 88.º do CIRC</span>
            </div>
            <span className="font-mono font-bold text-indigo-700 tabular-nums">
              +{formatCurrency(totalTributacoesAutonomas)}
            </span>
          </div>

          {/* Deduções à Coleta (PPC e Retenções) */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div>
              <span className="text-slate-700">
                (-) Deduções: Retenções na Fonte ({formatCurrency(irc.retencoesNaFonte)}) e Pagamentos por Conta ({formatCurrency(irc.pagamentosPorConta)})
              </span>
              <span className="block text-[11px] text-slate-400">Art. 90.º do CIRC</span>
            </div>
            <span className="font-mono font-bold text-emerald-700 tabular-nums">
              -{formatCurrency(totalDeducoes)}
            </span>
          </div>

          {/* RESULTADO FINAL: IRC ESTIMADO */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between font-bold">
            <div>
              <span className="text-sm block">IRC ESTIMADO APURADO</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {ircEstimado >= 0 ? 'Imposto a Pagar ao Estado' : 'Imposto a Recuperar / Reembolso'}
              </span>
            </div>
            <div className="text-right">
              <span
                className={`text-2xl font-mono tabular-nums ${
                  ircEstimado > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {formatCurrency(ircEstimado)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABELA DE CORREÇÕES FISCAIS (Secção 12) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Mapa Analítico de Correções Fiscais — Quadro 07 da Modelo 22
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Conta | Descrição | Valor Contabilístico | Correção Fiscal | Valor Fiscal | Referência Legal
            </p>
          </div>
          <button
            onClick={() => setIsAddCorrectionOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-md text-slate-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Linha</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-2.5">Quadro 22</th>
                <th className="px-4 py-2.5">Conta</th>
                <th className="px-4 py-2.5">Descrição da Correção</th>
                <th className="px-4 py-2.5 text-right">Valor Contabilístico</th>
                <th className="px-4 py-2.5 text-right">Correção Fiscal</th>
                <th className="px-4 py-2.5 text-right">Valor Fiscal</th>
                <th className="px-4 py-2.5">Referência Legal</th>
                <th className="px-4 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {irc.correcoes.map((cor) => (
                <tr key={cor.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                    {cor.quadro22Linha}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-800">{cor.conta}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-slate-800">{cor.descricao}</span>
                    {cor.observacoes && (
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {cor.observacoes}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700 tabular-nums">
                    {formatCurrency(cor.valorContabilistico)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono font-bold tabular-nums ${
                      cor.tipoCorrecao === 'positiva' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {cor.tipoCorrecao === 'positiva' ? '+' : '-'}
                    {formatCurrency(cor.correcaoFiscal)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-900 tabular-nums">
                    {formatCurrency(cor.valorFiscal)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                      {cor.referenciaLegal}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteCorrection(cor.id, cor.descricao)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Correção Fiscal */}
      {isAddCorrectionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Adicionar Correção Fiscal ao Quadro 07 (Modelo 22)
              </h3>
              <button onClick={() => setIsAddCorrectionOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateCorrection} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Correção
                  </label>
                  <select
                    value={newCor.tipoCorrecao}
                    onChange={(e) => setNewCor({ ...newCor, tipoCorrecao: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="positiva">(+) Positiva (Acréscimo ao Lucro)</option>
                    <option value="negativa">(-) Negativa (Dedução ao Lucro)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Campo Modelo 22
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Quadro 07 - Campo 713"
                    value={newCor.quadro22Linha}
                    onChange={(e) => setNewCor({ ...newCor, quadro22Linha: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descrição da Correção Fiscal *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Multas e coimas fiscais não dedutíveis"
                  value={newCor.descricao}
                  onChange={(e) => setNewCor({ ...newCor, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor Contabilístico (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCor.valorContabilistico}
                    onChange={(e) => setNewCor({ ...newCor, valorContabilistico: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor da Correção Fiscal (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCor.correcaoFiscal}
                    onChange={(e) => setNewCor({ ...newCor, correcaoFiscal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Conta SNC
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 68.8"
                    value={newCor.conta}
                    onChange={(e) => setNewCor({ ...newCor, conta: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Referência Legal
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Art. 23.º-A, n.º 1, al. e) CIRC"
                    value={newCor.referenciaLegal}
                    onChange={(e) => setNewCor({ ...newCor, referenciaLegal: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={newCor.observacoes}
                  onChange={(e) => setNewCor({ ...newCor, observacoes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddCorrectionOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer font-medium"
                >
                  Adicionar Correção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
