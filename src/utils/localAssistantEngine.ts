/**
 * Motor Local Especializado de Análise e Diagnóstico de Encerramento (100% Offline)
 * 
 * Executa todas as validações, contagens, ordenação de prioridades, cálculos de percentagens,
 * geração de minutas formais e respostas contabilísticas sem qualquer dependência de IA externa,
 * servidores ou chaves de faturação.
 */

import { Company, ExerciseData, PhaseProgress } from '../types';
import { formatCurrency, formatPercent } from './formatters';

export interface LocalDiagnosisReport {
  timestamp: string;
  resumoGlobal: string;
  diffAccountsCount: number;
  diffAccountsList: { codigo: string; descricao: string; diferenca: number }[];
  missingDocsCount: number;
  missingDocsList: string[];
  pendingTasksCount: number;
  pendingTasksList: string[];
  openQuestionsCount: number;
  openQuestionsList: string[];
  priorities: {
    nivel: 'critico' | 'atencao' | 'info';
    titulo: string;
    area: string;
    acaoRecomendada: string;
  }[];
  ircStatusText: string;
  taxSafetyNotice: string;
}

/**
 * Executa uma análise rigorosa e exaustiva aos dados do exercício fiscal atual
 */
export function runLocalExerciseAudit(
  company: Company,
  year: string,
  exerciseData: ExerciseData,
  progress: PhaseProgress
): LocalDiagnosisReport {
  // 1. Contas com diferenças
  const diffAccounts = exerciseData.accounts.filter((a) => Math.abs(a.diferenca) > 0.01);
  const diffAccountsList = diffAccounts.map((a) => ({
    codigo: a.codigoConta,
    descricao: a.descricao,
    diferenca: a.diferenca,
  }));

  // 2. Documentos em falta prioritários
  const standardEssentialDocs = [
    'Extrato Bancário Millennium BCP com saldo a 31/12',
    'Extrato Bancário Novo Banco com saldo a 31/12',
    'Listagem de Inventário Físico Final e Contagem de Existências',
    'Comprovativo de Reconciliação de Contas Correntes de Fornecedores',
    'Certidão de Não Dívida da Autoridade Tributária a 31/12',
    'Certidão de Não Dívida da Segurança Social a 31/12',
    'Contratos de Locação Financeira (Leasing) e ALD ativos',
    'Ata de Aprovação de Contas do Exercício Anterior',
  ];

  const presentDocNames = exerciseData.documents.map((d) => d.nome.toLowerCase());
  const missingDocsList = standardEssentialDocs.filter((reqDoc) => {
    const simplified = reqDoc.toLowerCase().split(' ')[0];
    return !presentDocNames.some((d) => d.includes(simplified));
  });

  // 3. Tarefas pendentes
  const pendingTasks = exerciseData.tasks.filter((t) => t.estado !== 'concluido');
  const pendingTasksList = pendingTasks.map((t) => `${t.area}: ${t.descricao}`);

  // 4. Questões fiscais por resolver
  const openQuestions = exerciseData.questions.filter((q) => q.estado !== 'resolvido');
  const openQuestionsList = openQuestions.map((q) => q.questao);

  // 5. Prioridades ordenadas
  const priorities: LocalDiagnosisReport['priorities'] = [];

  if (diffAccounts.length > 0) {
    priorities.push({
      nivel: 'critico',
      titulo: `${diffAccounts.length} conta(s) com diferenças de saldo a justificar`,
      area: 'Conferência de Contas',
      acaoRecomendada: `Verificar reconciliação analítica das contas: ${diffAccounts.slice(0, 3).map((a) => a.codigoConta).join(', ')}. Regularizar desvios antes de apurar resultados.`,
    });
  }

  const pendingReconciliations = exerciseData.banks.filter((b) => !b.reconciliacaoConcluida);
  if (pendingReconciliations.length > 0) {
    priorities.push({
      nivel: 'critico',
      titulo: `${pendingReconciliations.length} reconciliação(ões) bancária(s) por finalizar`,
      area: 'Bancos e Financiamentos',
      acaoRecomendada: 'Conferir o saldo bancário com o extrato oficial a 31 de dezembro e identificar cheques em trânsito ou débitos por refletir.',
    });
  }

  if (exerciseData.ircCalculation.estado !== 'concluido') {
    priorities.push({
      nivel: 'atencao',
      titulo: 'Apuramento de IRC em curso ou por concluir',
      area: 'Cálculo de IRC',
      acaoRecomendada: 'Rever o Quadro 07 da Modelo 22, confirmando as correções de depreciações, provisões fiscais e prejuízos reportáveis.',
    });
  }

  const unreviewedTA = exerciseData.autonomousTaxes.filter((t) => !t.revisto);
  if (unreviewedTA.length > 0) {
    priorities.push({
      nivel: 'atencao',
      titulo: `${unreviewedTA.length} encargo(s) de Tributação Autónoma sem revisão formal`,
      area: 'Tributações Autónomas',
      acaoRecomendada: 'Validar taxas aplicáveis do Art. 88.º do CIRC para viaturas ligeiras de passageiros e despesas de representação.',
    });
  }

  const unpostedAccruals = exerciseData.accruals.filter((a) => !a.lancamentoEfetuado);
  if (unpostedAccruals.length > 0) {
    priorities.push({
      nivel: 'atencao',
      titulo: `${unpostedAccruals.length} acréscimo(s) ou diferimento(s) com lançamento em falta`,
      area: 'Acréscimos e Diferimentos',
      acaoRecomendada: 'Efetuar os lançamentos de especialização do exercício (férias, subsídio de férias, encargos sociais e fornecimentos a faturar).',
    });
  }

  if (openQuestions.length > 0) {
    priorities.push({
      nivel: 'atencao',
      titulo: `${openQuestions.length} questão(ões) técnica(s) em aberto`,
      area: 'Questões Pendentes',
      acaoRecomendada: 'Obter confirmação do cliente ou parecer técnico para clarificar os lançamentos em análise.',
    });
  }

  if (missingDocsList.length > 0) {
    priorities.push({
      nivel: 'info',
      titulo: `${missingDocsList.length} documento(s) essencial(ais) em falta para o Dossier Fiscal`,
      area: 'Dossier Fiscal',
      acaoRecomendada: 'Enviar pedido formal de documentação ao cliente utilizando a minuta automática gerada pela aplicação.',
    });
  }

  const ircStatusText = exerciseData.ircCalculation.estado === 'concluido'
    ? `Apuramento validado: Imposto Estimado de ${formatCurrency(exerciseData.ircCalculation.ircAPagarOuRecuperar || 0)}.`
    : `Apuramento em aberto sobre RAI de ${formatCurrency(exerciseData.ircCalculation.resultadoContabilisticoAntesImpostos || 0)}.`;

  const resumoGlobal = `Diagnóstico Local do Encerramento para ${company.name} (${year}): O processo encontra-se com ${progress.global}% de conclusão global (Contabilístico: ${progress.contabilistico}%, Fiscal: ${progress.fiscal}%, Dossier Fiscal: ${progress.dossierFiscal}%). Foram detetadas ${diffAccounts.length} contas com diferenças de saldo, ${pendingTasks.length} tarefas pendentes e ${missingDocsList.length} documentos chave em falta.`;

  return {
    timestamp: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    resumoGlobal,
    diffAccountsCount: diffAccounts.length,
    diffAccountsList,
    missingDocsCount: missingDocsList.length,
    missingDocsList,
    pendingTasksCount: pendingTasks.length,
    pendingTasksList,
    openQuestionsCount: openQuestions.length,
    openQuestionsList,
    priorities,
    ircStatusText,
    taxSafetyNotice: 'Esta informação necessita de confirmação com base na legislação aplicável ao exercício fiscal em análise.',
  };
}

/**
 * Responde a consultas do utilizador no assistente usando motor local estruturado
 */
export function generateLocalAssistantResponse(
  prompt: string,
  company: Company,
  year: string,
  exerciseData: ExerciseData,
  progress: PhaseProgress,
  action?: string
): string {
  const audit = runLocalExerciseAudit(company, year, exerciseData, progress);
  const lowerPrompt = prompt.toLowerCase();

  // Ação explícita de pedido de documentos
  if (action === 'request_docs' || lowerPrompt.includes('document') || lowerPrompt.includes('pedir') || lowerPrompt.includes('minuta')) {
    return `Exmos. Senhores,\nAdministração / Direção de ${company.name}\n\n` +
      `Assunto: Encerramento de Contas do Exercício de ${year} — Documentação em Falta\n\n` +
      `No âmbito dos trabalhos preparatórios do encerramento contabilístico e organização do Dossier Fiscal (Art. 130.º do CIRC), solicitamos a disponibilização dos seguintes elementos prioritários:\n\n` +
      audit.missingDocsList.map((d) => `• ${d}`).join('\n') +
      `\n\nEstes elementos são imprescindíveis para a conferência final de saldos e o cumprimento tempestivo dos prazos de aprovação de contas e submissão da Modelo 22.\n\n` +
      `Com os melhores cumprimentos,\n${company.responsavelPrincipal}\nDepartamento de Contabilidade`;
  }

  // Ação de ponte contabilística para fiscal
  if (action === 'fiscal_bridge' || lowerPrompt.includes('ponte') || lowerPrompt.includes('quadro 07') || lowerPrompt.includes('irc')) {
    const rai = exerciseData.ircCalculation.resultadoContabilisticoAntesImpostos;
    const correcoes = exerciseData.ircCalculation.correcoes;
    const totalPositivas = correcoes.filter((c) => c.tipo === 'positiva').reduce((s, c) => s + c.valor, 0);
    const totalNegativas = correcoes.filter((c) => c.tipo === 'negativa').reduce((s, c) => s + c.valor, 0);
    const resultadoFiscal = rai + totalPositivas - totalNegativas;

    return `Ponte Contabilística para Fiscal — Quadro 07 da Modelo 22 (${company.name} / ${year}):\n\n` +
      `1. INFORMAÇÃO VALIDADA:\n` +
      `• Resultado Contabilístico Antes de Impostos (RAI): ${formatCurrency(rai)}\n` +
      `• Variações Positivas (Acréscimos ao Lucro Tributável): ${formatCurrency(totalPositivas)}\n` +
      `• Variações Negativas (Deduções ao Lucro Tributável): ${formatCurrency(totalNegativas)}\n` +
      `• Lucro Tributável Estimado: ${formatCurrency(resultadoFiscal)}\n` +
      `• Taxa Nominal de IRC: ${formatPercent(exerciseData.ircCalculation.taxaIrc * 100)}\n\n` +
      `2. INFORMAÇÃO A CONFIRMAR:\n` +
      `• Aplicação de regimes de reinvestimento de mais-valias (Art. 48.º CIRC);\n` +
      `• Limites de dedutibilidade de perdas por imparidade e amortizações fiscais;\n` +
      `• ${audit.taxSafetyNotice}`;
  }

  // Ação de tributações autónomas
  if (lowerPrompt.includes('autonoma') || lowerPrompt.includes('tributação') || lowerPrompt.includes('art. 88')) {
    const totalTA = exerciseData.autonomousTaxes.reduce((s, t) => s + (t.valorTA || 0), 0);
    const pendentesRevisao = exerciseData.autonomousTaxes.filter((t) => !t.revisto).length;

    return `Análise de Tributações Autónomas (Art. 88.º do CIRC) — ${company.name} (${year}):\n\n` +
      `• Total de Tributação Autónoma Calculada: ${formatCurrency(totalTA)}\n` +
      `• Itens de TA no exercício: ${exerciseData.autonomousTaxes.length} registos (${pendentesRevisao} aguardam revisão formal)\n\n` +
      `Pontos Críticos de Controlo:\n` +
      `1. Viaturas Ligeiras de Passageiros: Confirmar o escalão do custo de aquisição e tipologia (combustão, híbrido plug-in ou 100% elétrico);\n` +
      `2. Despesas de Representação: Sujeitas à taxa de 10%;\n` +
      `3. Ajudas de Custo e Compensações por Km: Sujeitas à taxa de 5% se não faturadas aos clientes;\n` +
      `4. Agravamento em caso de Prejuízo Fiscal: Se a empresa apurar prejuízo fiscal no exercício, as taxas de tributação autónoma sofrem um agravamento de 10 pontos percentuais.\n\n` +
      `Nota: ${audit.taxSafetyNotice}`;
  }

  // Ação de inventários
  if (lowerPrompt.includes('inventario') || lowerPrompt.includes('existencias') || lowerPrompt.includes('comunicação')) {
    const inv = exerciseData.inventory;
    return `Estado e Controlo dos Inventários — ${company.name} (${year}):\n\n` +
      `• Valor Contabilístico: ${formatCurrency(inv.valorContabilistico)}\n` +
      `• Valor Físico Apurado: ${formatCurrency(inv.valorFisico)}\n` +
      `• Diferença de Contagem: ${formatCurrency(inv.diferenca)} (${Math.abs(inv.diferenca) < 0.01 ? 'Sem quebras nem sobras' : 'Requer regularização'})\n` +
      `• Imparidade Estimada: ${formatCurrency(inv.valorImparidade)}\n` +
      `• Comunicação à AT (Ficheiro XML/CSV): ${inv.comunicacaoEfetuada ? 'Já submetida com sucesso' : 'PENDENTE DE SUBMISSÃO'}\n\n` +
      `Obrigações Legais: As empresas com contabilidade organizada são obrigadas a comunicar os inventários à Autoridade Tributária com referência a 31 de dezembro. Verifique os prazos aplicáveis no calendário da AT.`;
  }

  // Resumo geral e diagnóstico detalhado
  return `Diagnóstico do Encerramento Contabilístico e Fiscal (${company.name} — Exercício ${year}):\n\n` +
    `Estado Global de Conclusão: ${progress.global}%\n` +
    `• Encerramento Contabilístico: ${progress.contabilistico}%\n` +
    `• Encerramento Fiscal: ${progress.fiscal}%\n` +
    `• Organização do Dossier Fiscal: ${progress.dossierFiscal}%\n\n` +
    `Pontos de Atenção Imediata:\n` +
    (audit.priorities.length > 0
      ? audit.priorities.map((p, i) => `${i + 1}. [${p.area}] ${p.titulo}\n   → ${p.acaoRecomendada}`).join('\n\n')
      : '• Todas as conferências principais foram concluídas com sucesso.') +
    `\n\nLegislação & Conformidade:\n` +
    `• Os registos e documentos devem ser mantidos no Dossier Fiscal durante o prazo legal de 10 anos (Art. 130.º do CIRC).\n` +
    `• ${audit.taxSafetyNotice}`;
}
