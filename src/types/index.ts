export type ItemStatus =
  | 'concluido'
  | 'em_curso'
  | 'revisao'
  | 'em_falta'
  | 'nao_aplicavel'
  | 'nao_iniciado';

export type Priority = 'alta' | 'media' | 'baixa';

export interface Company {
  id: string;
  name: string;
  nif: string;
  cae: string;
  regimeIrc: 'Geral' | 'PME' | 'Isenção' | 'Pequena Empresa';
  regimeIva: 'Mensal' | 'Trimestral';
  dataInicioAtividade: string; // DD/MM/AAAA
  exercicioAtivo: string; // ex: '2026'
  responsavelPrincipal: string;
  revisor: string;
  observacoes: string;
}

export interface PhaseProgress {
  contabilistico: number;
  fiscal: number;
  dossierFiscal: number;
  global: number;
}

export interface AccountCheckItem {
  id: string;
  codigoConta: string;
  descricao: string;
  area: string; // Caixa, Bancos, Clientes, etc.
  saldoContabilistico: number;
  saldoConferido: number;
  diferenca: number;
  motivoDiferenca: string;
  estado: ItemStatus;
  responsavel: string;
  documentoSuporte: string;
  observacoes: string;
  conclusao: string;
  preparadoPor: string;
  revistoPor: string;
  dataConclusao?: string;
}

export interface AccrualItem {
  id: string;
  descricao: string;
  entidade: string;
  conta: string;
  tipo: 'acrescimo' | 'diferimento';
  subtipo: 'gasto_a_pagar' | 'rendimento_a_receber' | 'gasto_a_diferir' | 'rendimento_a_diferir';
  periodo: string;
  valor: number;
  valorReconhecido: number;
  valorPendente: number;
  lancamentoEfetuado: boolean;
  documento: string;
  responsavel: string;
  observacoes: string;
  estado: ItemStatus;
  preparadoPor: string;
  revistoPor: string;
}

export interface AssetItem {
  id: string;
  numeroAtivo: string;
  descricao: string;
  categoria: 'viaturas' | 'imoveis' | 'equipamentos' | 'outros';
  tipoMovimento: 'aquisicao' | 'alienacao' | 'abate' | 'transferencia' | 'existente';
  dataAquisicao: string;
  valorAquisicao: number;
  valorContabilistico: number;
  depreciacaoAcumulada: number;
  valorLiquido: number;
  taxaDepreciacao: number; // ex: 25%
  conta: string;
  centroCusto: string;
  documento: string;
  diferencaReconciliacao: number;
  observacoes: string;
  responsavel: string;
  estado: ItemStatus;
}

export interface InventoryData {
  valorContabilistico: number;
  valorFisico: number;
  diferenca: number;
  valorImparidade: number;
  valorFinal: number;
  metodoValorizacao: 'Custo Médio Ponderado' | 'FIFO' | 'Custo Padrão';
  inventarioRecebido: boolean;
  contagemEfetuada: boolean;
  reconciliacaoConcluida: boolean;
  diferencasJustificadas: boolean;
  imparidadeAnalisada: boolean;
  comunicacaoEfetuada: boolean;
  documentoContagem: string;
  responsavel: string;
  revisor: string;
  observacoes: string;
  estado: ItemStatus;
}

export interface SubsidyItem {
  id: string;
  nome: string;
  entidadeConcedente: string;
  referencia: string;
  dataAprovacao: string;
  montanteAprovado: number;
  montanteRecebido: number;
  montanteJaReconhecido: number;
  montanteReconhecidoExercicio: number;
  saldoPorReconhecer: number;
  metodoImputacao: string;
  contasUtilizadas: string;
  documentacao: string;
  impactoContabilistico: string;
  impactoFiscal: string;
  observacoes: string;
  responsavel: string;
  estado: ItemStatus;
}

export interface InternalWorkItem {
  id: string;
  projeto: string;
  descricao: string;
  natureza: string;
  periodo: string;
  trabalhadoresEnvolvidos: string;
  horas: number;
  custoMaoObra: number;
  materiais: number;
  outrosCustos: number;
  valorTotal: number;
  criterioUtilizado: string;
  contaContabilistica: string;
  documentacaoJustificativa: string;
  responsavel: string;
  revisao: string;
  observacoes: string;
  estado: ItemStatus;
}

export interface AutonomousTaxItem {
  id: string;
  data: string;
  documento: string;
  fornecedor: string;
  descricao: string;
  contaContabilistica: string;
  valor: number;
  categoria:
    | 'viaturas'
    | 'despesas_representacao'
    | 'ajudas_custo'
    | 'deslocacoes'
    | 'despesas_nao_documentadas'
    | 'remuneracoes_bonus'
    | 'outras';
  enquadramentoFiscal: string;
  sujeito: boolean;
  motivo: string;
  taxa: number | null; // ex: 10%, 27.5% etc.
  taxaStatus: 'validada' | 'por_confirmar';
  valorTA: number;
  responsavel: string;
  revisto: boolean;
  observacoes: string;
}

export interface TaxCorrectionItem {
  id: string;
  quadro22Linha: string;
  conta: string;
  descricao: string;
  valorContabilistico: number;
  correcaoFiscal: number;
  valorFiscal: number;
  tipoCorrecao: 'positiva' | 'negativa';
  referenciaLegal: string;
  referenciaValidada: boolean;
  documento: string;
  responsavel: string;
  observacoes: string;
}

export interface IrcCalculationData {
  resultadoContabilisticoAntesImpostos: number;
  correcoes: TaxCorrectionItem[];
  prejuizosFiscaisReportaveis: number;
  beneficiosFiscaisDedutiveis: number;
  taxaIrc: number; // ex: 0.21 ou 0.17
  taxaReduzidaPmeAplicavel: boolean;
  limiteTaxaReduzida: number; // 50 000 €
  derramaMunicipalTaxa: number; // ex: 0.015
  derramaEstadual: number;
  retencoesNaFonte: number;
  pagamentosPorConta: number; // soma dos 3 PPC
  pagamentoAdicionalPorConta: number;
  responsavel: string;
  revisor: string;
  estado: ItemStatus;
  observacoes: string;
}

export interface TaxBenefitItem {
  id: string;
  nome: string;
  descricao: string;
  legislacaoAplicavel: string;
  periodo: string;
  investimentoElegivel: number;
  beneficioPotencial: number;
  beneficioUtilizado: number;
  limite: number;
  saldoDisponivel: number;
  documentoSuporte: string;
  observacoes: string;
  estado: 'Em análise' | 'Elegível' | 'Não elegível' | 'Utilizado' | 'A rever';
  responsavel: string;
}

export interface FinancialStatementItem {
  id: string;
  nome: string; // Balanço, Demonstração dos Resultados, etc.
  obrigatorio: boolean;
  preparado: boolean;
  revisto: boolean;
  aprovado: boolean;
  documentoAssociado: string;
  data: string;
  responsavel: string;
  observacoes: string;
}

export interface TaxObligationItem {
  id: string;
  descricao: string; // Modelo 22, IES, etc.
  periodo: string;
  prazo: string;
  prazoStatus: 'validado' | 'por_confirmar';
  responsavel: string;
  dataSubmissao?: string;
  comprovativo: string;
  estado: 'Por preparar' | 'Preparado' | 'Por submeter' | 'Submetido' | 'Validado' | 'Necessita correção';
  observacoes: string;
}

export interface ImpairmentItem {
  id: string;
  descricao: string;
  entidade: string;
  categoria: 'clientes' | 'inventarios' | 'ativos' | 'processos_judiciais' | 'responsabilidades' | 'outras';
  valor: number;
  risco: 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
  percentagem: number;
  imparidadeProposta: number;
  imparidadeContabilizada: number;
  diferenca: number;
  fundamentacao: string;
  documento: string;
  impactoFiscal: string;
  responsavel: string;
  estado: ItemStatus;
}

export interface BankItem {
  id: string;
  banco: string;
  tipoConta: 'Ordem' | 'Financiamento' | 'Caucionada' | 'Leasing';
  contaContabilistica: string;
  saldoContabilistico: number;
  saldoBancario: number;
  diferenca: number;
  extratoAssociado: string;
  reconciliacaoConcluida: boolean;
  capitalEmDivida?: number;
  jurosPeriodo?: number;
  responsavel: string;
  observacoes: string;
}

export interface ThirdPartyAnomaly {
  id: string;
  tipo: 'cliente' | 'fornecedor';
  entidade: string;
  nif: string;
  contaContabilistica: string;
  saldo: number;
  tipoAnomalia: 'saldo_credor_cliente' | 'saldo_devedor_fornecedor' | 'antigo_mais_180_dias' | 'sem_movimento' | 'confirmacao_necessaria';
  diasAberto: number;
  valorRelevante: boolean;
  circularizacaoEnviada: boolean;
  circularizacaoRecebida: boolean;
  responsavel: string;
  observacoes: string;
  estado: ItemStatus;
}

export interface PersonnelClosingItem {
  id: string;
  rubrica: 'remuneracoes' | 'ferias' | 'subsidio_ferias' | 'subsidio_natal' | 'acrescimos_encargos' | 'seguranca_social' | 'retencoes_irs' | 'indemnizacoes' | 'ajudas_custo';
  descricao: string;
  contaContabilistica: string;
  valorProcessado: number;
  valorContabilizado: number;
  diferenca: number;
  documentoSuporte: string;
  responsavel: string;
  estado: ItemStatus;
  observacoes: string;
}

export interface RelatedPartyItem {
  id: string;
  entidade: string;
  nif: string;
  tipoRelacao: 'Sociedade-mãe' | 'Subsidiária' | 'Gerência/Administração' | 'Sócio com participação qualificada';
  operacao: string;
  valor: number;
  saldo: number;
  documentacao: string;
  analiseFiscalNecessaria: boolean;
  dossierPrecosTransferenciaNecessario: boolean;
  observacoes: string;
  responsavel: string;
  estado: ItemStatus;
}

export interface DocumentRecord {
  id: string;
  nome: string;
  categoria: string;
  tipoFicheiro: 'pdf' | 'excel' | 'word' | 'csv' | 'imagem';
  tamanho: string;
  data: string; // DD/MM/AAAA
  autor: string;
  exercicio: string;
  area: string;
  contaAssociada?: string;
  tarefaAssociada?: string;
  operacaoAssociada?: string;
  observacoes: string;
  urlMock?: string;
  fileStoredInIndexedDB?: boolean;
}

export interface ChecklistTask {
  id: string;
  descricao: string;
  area: string;
  prioridade: Priority;
  estado: ItemStatus;
  responsavel: string;
  preparadoPor: string;
  revistoPor: string;
  dataLimite: string;
  dataConclusao?: string;
  documento?: string;
  observacoes: string;
  conclusao?: string;
}

export interface PendingQuestion {
  id: string;
  questao: string;
  area: string;
  data: string;
  responsavel: string;
  prioridade: Priority;
  estado: 'por_analisar' | 'aguarda_informacao' | 'resolvido';
  resposta?: string;
  conclusao?: string;
  documentoAssociado?: string;
}

export interface ClosingNote {
  id: string;
  data: string;
  assunto: string;
  descricao: string;
  responsavel: string;
  conta?: string;
  impactoContabilistico: string;
  impactoFiscal: string;
  documento?: string;
  conclusao: string;
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  utilizador: string;
  area: string;
  alteracaoEfetuada: string;
  valorAnterior?: string;
  novoValor?: string;
}

export interface ExerciseData {
  year: string;
  closed: boolean;
  closedAt?: string;
  closedBy?: string;
  accounts: AccountCheckItem[];
  accruals: AccrualItem[];
  assets: AssetItem[];
  inventory: InventoryData;
  subsidies: SubsidyItem[];
  internalWorks: InternalWorkItem[];
  autonomousTaxes: AutonomousTaxItem[];
  ircCalculation: IrcCalculationData;
  taxBenefits: TaxBenefitItem[];
  financialStatements: FinancialStatementItem[];
  taxObligations: TaxObligationItem[];
  impairments: ImpairmentItem[];
  banks: BankItem[];
  thirdParties: ThirdPartyAnomaly[];
  personnel: PersonnelClosingItem[];
  relatedParties: RelatedPartyItem[];
  documents: DocumentRecord[];
  tasks: ChecklistTask[];
  questions: PendingQuestion[];
  notes: ClosingNote[];
  history: HistoryLog[];
  twoStepReviewRequired: boolean; // Um item só é concluído se revisto
}
