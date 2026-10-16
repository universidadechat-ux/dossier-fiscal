import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Company,
  ExerciseData,
  PhaseProgress,
  AccountCheckItem,
  AccrualItem,
  AssetItem,
  InventoryData,
  SubsidyItem,
  InternalWorkItem,
  AutonomousTaxItem,
  TaxCorrectionItem,
  IrcCalculationData,
  TaxBenefitItem,
  FinancialStatementItem,
  TaxObligationItem,
  ImpairmentItem,
  BankItem,
  ThirdPartyAnomaly,
  PersonnelClosingItem,
  RelatedPartyItem,
  DocumentRecord,
  ChecklistTask,
  PendingQuestion,
  ClosingNote,
  HistoryLog,
} from '../types';
import {
  INITIAL_COMPANIES,
  EXERCISE_2026_LUSITANIA,
  EXERCISE_2025_LUSITANIA,
} from '../data/mockDatabase';
import {
  loadCompaniesFromIndexedDB,
  saveCompaniesToIndexedDB,
  loadExercisesFromIndexedDB,
  saveExercisesToIndexedDB,
  saveDocumentFileToIndexedDB,
  getDocumentFileFromIndexedDB,
  deleteDocumentFileFromIndexedDB,
  exportCompleteBackup,
  importCompleteBackup,
  triggerFileDownload,
} from '../utils/indexedDB';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  companies: Company[];
  currentCompany: Company;
  currentYear: string;
  availableYears: string[];
  exerciseData: ExerciseData;
  progress: PhaseProgress;
  selectCompany: (id: string) => void;
  selectYear: (year: string) => void;
  addCompany: (company: Partial<Company>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;

  // View Navigation
  activeView: string;
  setActiveView: (view: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  // Modals
  isAuditModalOpen: boolean;
  openAuditModal: () => void;
  closeAuditModal: () => void;

  isAssistantOpen: boolean;
  assistantInitialPrompt: string;
  assistantInitialAction: string;
  openAssistant: (prompt?: string, action?: string) => void;
  closeAssistant: () => void;

  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;

  isDocRequestModalOpen: boolean;
  openDocRequestModal: () => void;
  closeDocRequestModal: () => void;

  isCloseExerciseModalOpen: boolean;
  openCloseExerciseModal: () => void;
  closeCloseExerciseModal: () => void;

  // Exercise Data Updates
  updateAccount: (id: string, updates: Partial<AccountCheckItem>) => void;
  addAccount: (item: Omit<AccountCheckItem, 'id' | 'diferenca'>) => void;
  deleteAccount: (id: string) => void;

  updateAccrual: (id: string, updates: Partial<AccrualItem>) => void;
  addAccrual: (item: Omit<AccrualItem, 'id'>) => void;
  deleteAccrual: (id: string) => void;

  updateAsset: (id: string, updates: Partial<AssetItem>) => void;
  addAsset: (item: Omit<AssetItem, 'id'>) => void;
  deleteAsset: (id: string) => void;

  updateInventory: (updates: Partial<InventoryData>) => void;

  updateSubsidy: (id: string, updates: Partial<SubsidyItem>) => void;
  addSubsidy: (item: Omit<SubsidyItem, 'id'>) => void;
  deleteSubsidy: (id: string) => void;

  updateInternalWork: (id: string, updates: Partial<InternalWorkItem>) => void;
  addInternalWork: (item: Omit<InternalWorkItem, 'id'>) => void;
  deleteInternalWork: (id: string) => void;

  updateAutonomousTax: (id: string, updates: Partial<AutonomousTaxItem>) => void;
  addAutonomousTax: (item: Omit<AutonomousTaxItem, 'id'>) => void;
  deleteAutonomousTax: (id: string) => void;

  updateIrcCalculation: (updates: Partial<IrcCalculationData>) => void;
  addTaxCorrection: (item: Omit<TaxCorrectionItem, 'id'>) => void;
  deleteTaxCorrection: (id: string) => void;

  updateTaxBenefit: (id: string, updates: Partial<TaxBenefitItem>) => void;
  addTaxBenefit: (item: Omit<TaxBenefitItem, 'id'>) => void;
  deleteTaxBenefit: (id: string) => void;

  updateFinancialStatement: (id: string, updates: Partial<FinancialStatementItem>) => void;
  updateTaxObligation: (id: string, updates: Partial<TaxObligationItem>) => void;

  updateImpairment: (id: string, updates: Partial<ImpairmentItem>) => void;
  addImpairment: (item: Omit<ImpairmentItem, 'id' | 'diferenca'>) => void;
  deleteImpairment: (id: string) => void;

  updateBank: (id: string, updates: Partial<BankItem>) => void;
  updateThirdParty: (id: string, updates: Partial<ThirdPartyAnomaly>) => void;
  updatePersonnel: (id: string, updates: Partial<PersonnelClosingItem>) => void;
  updateRelatedParty: (id: string, updates: Partial<RelatedPartyItem>) => void;

  addDocument: (doc: Omit<DocumentRecord, 'id'>) => void;
  deleteDocument: (id: string) => void;

  updateTask: (id: string, updates: Partial<ChecklistTask>) => void;
  addTask: (task: Omit<ChecklistTask, 'id'>) => void;
  deleteTask: (id: string) => void;

  updateQuestion: (id: string, updates: Partial<PendingQuestion>) => void;
  addQuestion: (q: Omit<PendingQuestion, 'id'>) => void;
  deleteQuestion: (id: string) => void;

  addNote: (note: Omit<ClosingNote, 'id'>) => void;
  deleteNote: (id: string) => void;

  toggleTwoStepReview: (enabled: boolean) => void;
  closeCurrentExercise: (userName: string, justification?: string) => void;
  reopenCurrentExercise: (userName: string) => void;

  // Persistência IndexedDB e Backup Local
  isIndexedDbReady: boolean;
  exportBackup: () => Promise<void>;
  importBackup: (fileContent: string) => Promise<boolean>;
  addDocumentWithFile: (
    doc: Omit<DocumentRecord, 'id'>,
    file?: { name: string; type: string; size: number; base64: string }
  ) => Promise<void>;
  downloadDocumentFile: (id: string, filename: string) => Promise<boolean>;

  // Alertas e Toasts
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Estatísticas e Pendentes Rápidos
  attentionItems: {
    id: string;
    title: string;
    description: string;
    level: 'critico' | 'atencao' | 'info';
    area: string;
    targetView: string;
  }[];
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('enc_empresas_pt');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [currentCompanyId, setCurrentCompanyId] = useState<string>(() => {
    return companies[0]?.id || 'empresa-1';
  });

  const [currentYear, setCurrentYear] = useState<string>('2026');
  const [activeViewState, setActiveViewState] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const setActiveView = (view: string) => {
    setActiveViewState(view);
    setIsMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const activeView = activeViewState;

  // Armazenamento de exercícios por empresa e ano
  const [exerciseStore, setExerciseStore] = useState<{ [key: string]: ExerciseData }>(() => {
    const saved = localStorage.getItem('enc_exercicios_store_pt');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler store:', e);
      }
    }
    return {
      'empresa-1_2026': EXERCISE_2026_LUSITANIA,
      'empresa-1_2025': EXERCISE_2025_LUSITANIA,
      'empresa-2_2026': {
        ...EXERCISE_2026_LUSITANIA,
        year: '2026',
        accounts: EXERCISE_2026_LUSITANIA.accounts.map((a) => ({ ...a, responsavel: 'Sofia Vale' })),
      },
    };
  });

  // Modais
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState('');
  const [assistantInitialAction, setAssistantInitialAction] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDocRequestModalOpen, setIsDocRequestModalOpen] = useState(false);
  const [isCloseExerciseModalOpen, setIsCloseExerciseModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isIndexedDbReady, setIsIndexedDbReady] = useState(false);

  // Inicialização assíncrona a partir do IndexedDB
  useEffect(() => {
    let isMounted = true;
    async function initIndexedDB() {
      try {
        const [idbCompanies, idbExercises] = await Promise.all([
          loadCompaniesFromIndexedDB(),
          loadExercisesFromIndexedDB(),
        ]);
        if (isMounted) {
          if (idbCompanies && idbCompanies.length > 0) {
            setCompanies(idbCompanies);
            localStorage.setItem('enc_empresas_pt', JSON.stringify(idbCompanies));
          } else {
            saveCompaniesToIndexedDB(companies);
          }
          if (idbExercises && Object.keys(idbExercises).length > 0) {
            setExerciseStore(idbExercises);
            localStorage.setItem('enc_exercicios_store_pt', JSON.stringify(idbExercises));
          } else {
            saveExercisesToIndexedDB(exerciseStore);
          }
          setIsIndexedDbReady(true);
        }
      } catch (err) {
        console.warn('Erro ao inicializar IndexedDB:', err);
        if (isMounted) setIsIndexedDbReady(true);
      }
    }
    initIndexedDB();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persistência automática em localStorage e IndexedDB
  useEffect(() => {
    localStorage.setItem('enc_empresas_pt', JSON.stringify(companies));
    saveCompaniesToIndexedDB(companies);
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('enc_exercicios_store_pt', JSON.stringify(exerciseStore));
    saveExercisesToIndexedDB(exerciseStore);
  }, [exerciseStore]);

  const currentCompany = useMemo(() => {
    return companies.find((c) => c.id === currentCompanyId) || companies[0];
  }, [companies, currentCompanyId]);

  const availableYears = useMemo(() => {
    return ['2026', '2025', '2024'];
  }, []);

  const storeKey = `${currentCompany.id}_${currentYear}`;

  const exerciseData: ExerciseData = useMemo(() => {
    if (exerciseStore[storeKey]) {
      return exerciseStore[storeKey];
    }
    // Criação inicial se não existir
    const defaultData: ExerciseData = {
      ...EXERCISE_2026_LUSITANIA,
      year: currentYear,
      closed: false,
    };
    return defaultData;
  }, [exerciseStore, storeKey, currentYear]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const selectCompany = (id: string) => {
    setCurrentCompanyId(id);
    showToast(`Empresa selecionada: ${companies.find((c) => c.id === id)?.name || ''}`, 'info');
  };

  const selectYear = (year: string) => {
    setCurrentYear(year);
    showToast(`Exercício fiscal selecionado: ${year}`, 'info');
  };

  const addCompany = (newComp: Partial<Company>) => {
    const id = `empresa-${Date.now()}`;
    const company: Company = {
      id,
      name: newComp.name || 'Nova Empresa, Lda.',
      nif: newComp.nif || '500000000',
      cae: newComp.cae || '00000',
      regimeIrc: newComp.regimeIrc || 'PME',
      regimeIva: newComp.regimeIva || 'Trimestral',
      dataInicioAtividade: newComp.dataInicioAtividade || '01/01/2026',
      exercicioAtivo: currentYear,
      responsavelPrincipal: newComp.responsavelPrincipal || 'Contabilista Certificado',
      revisor: newComp.revisor || '',
      observacoes: newComp.observacoes || '',
    };
    setCompanies((prev) => [...prev, company]);
    setCurrentCompanyId(id);
    showToast(`Empresa "${company.name}" criada com sucesso.`);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Dados da empresa atualizados com sucesso.');
  };

  // Helper para atualizar os dados do exercício atual
  const setExerciseData = (updater: (prev: ExerciseData) => ExerciseData) => {
    setExerciseStore((prevStore) => {
      const current = prevStore[storeKey] || { ...EXERCISE_2026_LUSITANIA, year: currentYear };
      const updated = updater(current);
      return {
        ...prevStore,
        [storeKey]: updated,
      };
    });
  };

  // Regista no histórico
  const addLog = (area: string, descricao: string, valorAnt?: string, valorNov?: string) => {
    const newEntry: HistoryLog = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      utilizador: currentCompany.responsavelPrincipal.split(' ')[0] || 'Utilizador',
      area,
      alteracaoEfetuada: descricao,
      valorAnterior: valorAnt,
      novoValor: valorNov,
    };
    setExerciseData((prev) => ({
      ...prev,
      history: [newEntry, ...(prev.history || [])],
    }));
  };

  // Cálculo de Progresso das Três Fases
  const progress: PhaseProgress = useMemo(() => {
    // 1. Encerramento Contabilístico:
    // Contas sem diferença e concluídas, inventário validado, ativos conferidos, acréscimos lançados
    const accTotal = exerciseData.accounts.length || 1;
    const accDone = exerciseData.accounts.filter(
      (a) => a.estado === 'concluido' && Math.abs(a.diferenca) < 0.01
    ).length;

    const accrualsTotal = exerciseData.accruals.length || 1;
    const accrualsDone = exerciseData.accruals.filter((a) => a.lancamentoEfetuado).length;

    const assetsConferidos = exerciseData.assets.length > 0 ? 1 : 0;
    const invConferido = exerciseData.inventory.reconciliacaoConcluida ? 1 : 0;

    const contabilisticoRatio = (accDone / accTotal) * 0.45 +
      (accrualsDone / accrualsTotal) * 0.25 +
      assetsConferidos * 0.15 +
      invConferido * 0.15;

    const contabilisticoPercent = Math.min(100, Math.round(contabilisticoRatio * 100));

    // 2. Encerramento Fiscal:
    // Cálculo de IRC em curso/concluído, TA revistas, benefícios analisados, obrigações preparadas
    const ircRatio = exerciseData.ircCalculation.estado === 'concluido' ? 1 : 0.6;
    const taTotal = exerciseData.autonomousTaxes.length || 1;
    const taDone = exerciseData.autonomousTaxes.filter((t) => t.revisto).length;
    const benRatio = exerciseData.taxBenefits.length > 0 ? 0.8 : 0.5;

    const fiscalRatio = ircRatio * 0.4 + (taDone / taTotal) * 0.4 + benRatio * 0.2;
    const fiscalPercent = Math.min(100, Math.round(fiscalRatio * 100));

    // 3. Dossier Fiscal:
    // Demonstrações financeiras concluídas, documentos arquivados, tarefas do dossier concluídas
    const fsTotal = exerciseData.financialStatements.length || 1;
    const fsDone = exerciseData.financialStatements.filter((f) => f.preparado).length;

    const tasksTotal = exerciseData.tasks.length || 1;
    const tasksDone = exerciseData.tasks.filter((t) => t.estado === 'concluido').length;

    const docsRatio = Math.min(1, exerciseData.documents.length / 8);

    const dossierRatio = (fsDone / fsTotal) * 0.45 + (tasksDone / tasksTotal) * 0.35 + docsRatio * 0.20;
    const dossierPercent = Math.min(100, Math.round(dossierRatio * 100));

    const globalPercent = Math.round((contabilisticoPercent + fiscalPercent + dossierPercent) / 3);

    return {
      contabilistico: contabilisticoPercent,
      fiscal: fiscalPercent,
      dossierFiscal: dossierPercent,
      global: globalPercent,
    };
  }, [exerciseData]);

  // Lista de Itens de Atenção Necessária Automática
  const attentionItems = useMemo(() => {
    const list: {
      id: string;
      title: string;
      description: string;
      level: 'critico' | 'atencao' | 'info';
      area: string;
      targetView: string;
    }[] = [];

    // 1. Contas com diferenças
    const diffAccounts = exerciseData.accounts.filter((a) => Math.abs(a.diferenca) > 0.01);
    if (diffAccounts.length > 0) {
      list.push({
        id: 'att-diff-accounts',
        title: `${diffAccounts.length} contas com diferenças por justificar`,
        description: `Existem diferenças de saldo em contas críticas (${diffAccounts.map((a) => a.codigoConta).slice(0, 3).join(', ')}).`,
        level: 'critico',
        area: 'Conferência de Contas',
        targetView: 'conferencia_contas',
      });
    }

    // 2. Acréscimos por lançar
    const pendingAccruals = exerciseData.accruals.filter((a) => !a.lancamentoEfetuado);
    if (pendingAccruals.length > 0) {
      list.push({
        id: 'att-accruals',
        title: `${pendingAccruals.length} acréscimo(s) ou diferimento(s) pendentes de lançamento`,
        description: 'Custos ou proveitos do exercício ainda não registados no diário de operações.',
        level: 'atencao',
        area: 'Acréscimos e Diferimentos',
        targetView: 'acrescimos',
      });
    }

    // 3. Tributações autónomas não revistas
    const unreviewedTA = exerciseData.autonomousTaxes.filter((t) => !t.revisto);
    if (unreviewedTA.length > 0) {
      list.push({
        id: 'att-ta',
        title: `${unreviewedTA.length} item(ns) de Tributação Autónoma por rever`,
        description: 'Existem encargos sujeitos a tributação autónoma que requerem confirmação do ROC/Contabilista.',
        level: 'atencao',
        area: 'Tributações Autónomas',
        targetView: 'tributacoes_autonomas',
      });
    }

    // 4. Questões fiscais abertas
    const openQuestions = exerciseData.questions.filter((q) => q.estado !== 'resolvido');
    if (openQuestions.length > 0) {
      list.push({
        id: 'att-questions',
        title: `${openQuestions.length} questão(ões) pendente(s) de resposta`,
        description: 'Dúvidas contabilísticas e fiscais com impacto no encerramento aguardam clarificação.',
        level: 'atencao',
        area: 'Questões Pendentes',
        targetView: 'questoes',
      });
    }

    // 5. Inventário comunicação pendente
    if (!exerciseData.inventory.comunicacaoEfetuada) {
      list.push({
        id: 'att-inv-comm',
        title: 'Comunicação do Inventário à AT pendente',
        description: 'Ficheiro de inventário físico com data de referência 31/12 requer envio à AT.',
        level: 'info',
        area: 'Inventários',
        targetView: 'inventarios',
      });
    }

    return list;
  }, [exerciseData]);

  // Actions
  const updateAccount = (id: string, updates: Partial<AccountCheckItem>) => {
    setExerciseData((prev) => {
      const updatedAccounts = prev.accounts.map((acc) => {
        if (acc.id === id) {
          const saldoContabilistico = updates.saldoContabilistico ?? acc.saldoContabilistico;
          const saldoConferido = updates.saldoConferido ?? acc.saldoConferido;
          const diferenca = Number((saldoContabilistico - saldoConferido).toFixed(2));
          return {
            ...acc,
            ...updates,
            saldoContabilistico,
            saldoConferido,
            diferenca,
          };
        }
        return acc;
      });
      return { ...prev, accounts: updatedAccounts };
    });
    addLog('Conferência de Contas', `Conta atualizada`);
    showToast('Conta atualizada com sucesso.');
  };

  const addAccount = (item: Omit<AccountCheckItem, 'id' | 'diferenca'>) => {
    const id = `acc-${Date.now()}`;
    const diferenca = Number((item.saldoContabilistico - item.saldoConferido).toFixed(2));
    const newAcc: AccountCheckItem = { ...item, id, diferenca };
    setExerciseData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAcc],
    }));
    addLog('Conferência de Contas', `Conta ${item.codigoConta} adicionada`);
    showToast(`Conta ${item.codigoConta} adicionada.`);
  };

  const deleteAccount = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
    }));
    showToast('Conta eliminada.');
  };

  const updateAccrual = (id: string, updates: Partial<AccrualItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      accruals: prev.accruals.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
    showToast('Acréscimo/Diferimento atualizado.');
  };

  const addAccrual = (item: Omit<AccrualItem, 'id'>) => {
    const id = `acr-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      accruals: [...prev.accruals, { ...item, id }],
    }));
    showToast('Item registado com sucesso.');
  };

  const deleteAccrual = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      accruals: prev.accruals.filter((a) => a.id !== id),
    }));
    showToast('Item eliminado.');
  };

  const updateAsset = (id: string, updates: Partial<AssetItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
    showToast('Ativo atualizado.');
  };

  const addAsset = (item: Omit<AssetItem, 'id'>) => {
    const id = `ast-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      assets: [...prev.assets, { ...item, id }],
    }));
    showToast('Ativo adicionado ao mapa.');
  };

  const deleteAsset = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
    }));
    showToast('Ativo removido.');
  };

  const updateInventory = (updates: Partial<InventoryData>) => {
    setExerciseData((prev) => {
      const inv = { ...prev.inventory, ...updates };
      inv.diferenca = Number((inv.valorContabilistico - inv.valorFisico).toFixed(2));
      inv.valorFinal = Number((inv.valorFisico - inv.valorImparidade).toFixed(2));
      return { ...prev, inventory: inv };
    });
    showToast('Inventários atualizados.');
  };

  const updateSubsidy = (id: string, updates: Partial<SubsidyItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      subsidies: prev.subsidies.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    showToast('Subsídio atualizado.');
  };

  const addSubsidy = (item: Omit<SubsidyItem, 'id'>) => {
    const id = `sub-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      subsidies: [...prev.subsidies, { ...item, id }],
    }));
    showToast('Subsídio registado.');
  };

  const deleteSubsidy = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      subsidies: prev.subsidies.filter((s) => s.id !== id),
    }));
    showToast('Subsídio removido.');
  };

  const updateInternalWork = (id: string, updates: Partial<InternalWorkItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      internalWorks: prev.internalWorks.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
    showToast('Trabalho interno atualizado.');
  };

  const addInternalWork = (item: Omit<InternalWorkItem, 'id'>) => {
    const id = `tp-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      internalWorks: [...prev.internalWorks, { ...item, id }],
    }));
    showToast('Trabalho interno registado.');
  };

  const deleteInternalWork = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      internalWorks: prev.internalWorks.filter((w) => w.id !== id),
    }));
    showToast('Trabalho interno removido.');
  };

  const updateAutonomousTax = (id: string, updates: Partial<AutonomousTaxItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      autonomousTaxes: prev.autonomousTaxes.map((t) => {
        if (t.id === id) {
          const item = { ...t, ...updates };
          if (item.sujeito && item.taxa !== null) {
            item.valorTA = Number((item.valor * item.taxa).toFixed(2));
          } else {
            item.valorTA = 0;
          }
          return item;
        }
        return t;
      }),
    }));
    showToast('Tributação Autónoma atualizada.');
  };

  const addAutonomousTax = (item: Omit<AutonomousTaxItem, 'id'>) => {
    const id = `ta-${Date.now()}`;
    const valorTA = item.sujeito && item.taxa !== null ? Number((item.valor * item.taxa).toFixed(2)) : 0;
    setExerciseData((prev) => ({
      ...prev,
      autonomousTaxes: [...prev.autonomousTaxes, { ...item, id, valorTA }],
    }));
    showToast('Registo de Tributação Autónoma adicionado.');
  };

  const deleteAutonomousTax = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      autonomousTaxes: prev.autonomousTaxes.filter((t) => t.id !== id),
    }));
    showToast('Registo removido.');
  };

  const updateIrcCalculation = (updates: Partial<IrcCalculationData>) => {
    setExerciseData((prev) => ({
      ...prev,
      ircCalculation: { ...prev.ircCalculation, ...updates },
    }));
    showToast('Cálculo de IRC atualizado.');
  };

  const addTaxCorrection = (item: Omit<TaxCorrectionItem, 'id'>) => {
    const id = `cor-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      ircCalculation: {
        ...prev.ircCalculation,
        correcoes: [...prev.ircCalculation.correcoes, { ...item, id }],
      },
    }));
    showToast('Correção fiscal adicionada ao Quadro 07.');
  };

  const deleteTaxCorrection = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      ircCalculation: {
        ...prev.ircCalculation,
        correcoes: prev.ircCalculation.correcoes.filter((c) => c.id !== id),
      },
    }));
    showToast('Correção fiscal eliminada.');
  };

  const updateTaxBenefit = (id: string, updates: Partial<TaxBenefitItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      taxBenefits: prev.taxBenefits.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
    showToast('Benefício fiscal atualizado.');
  };

  const addTaxBenefit = (item: Omit<TaxBenefitItem, 'id'>) => {
    const id = `ben-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      taxBenefits: [...prev.taxBenefits, { ...item, id }],
    }));
    showToast('Benefício fiscal registado.');
  };

  const deleteTaxBenefit = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      taxBenefits: prev.taxBenefits.filter((b) => b.id !== id),
    }));
    showToast('Benefício fiscal removido.');
  };

  const updateFinancialStatement = (id: string, updates: Partial<FinancialStatementItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      financialStatements: prev.financialStatements.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
    showToast('Demonstração Financeira atualizada.');
  };

  const updateTaxObligation = (id: string, updates: Partial<TaxObligationItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      taxObligations: prev.taxObligations.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }));
    showToast('Obrigação fiscal atualizada.');
  };

  const updateImpairment = (id: string, updates: Partial<ImpairmentItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      impairments: prev.impairments.map((i) => {
        if (i.id === id) {
          const item = { ...i, ...updates };
          item.diferenca = Number((item.imparidadeProposta - item.imparidadeContabilizada).toFixed(2));
          return item;
        }
        return i;
      }),
    }));
    showToast('Imparidade atualizada.');
  };

  const addImpairment = (item: Omit<ImpairmentItem, 'id' | 'diferenca'>) => {
    const id = `imp-${Date.now()}`;
    const diferenca = Number((item.imparidadeProposta - item.imparidadeContabilizada).toFixed(2));
    setExerciseData((prev) => ({
      ...prev,
      impairments: [...prev.impairments, { ...item, id, diferenca }],
    }));
    showToast('Imparidade registada.');
  };

  const deleteImpairment = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      impairments: prev.impairments.filter((i) => i.id !== id),
    }));
    showToast('Imparidade removida.');
  };

  const updateBank = (id: string, updates: Partial<BankItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      banks: prev.banks.map((b) => {
        if (b.id === id) {
          const item = { ...b, ...updates };
          item.diferenca = Number((item.saldoContabilistico - item.saldoBancario).toFixed(2));
          return item;
        }
        return b;
      }),
    }));
    showToast('Conta bancária atualizada.');
  };

  const updateThirdParty = (id: string, updates: Partial<ThirdPartyAnomaly>) => {
    setExerciseData((prev) => ({
      ...prev,
      thirdParties: prev.thirdParties.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    showToast('Registo de terceiros atualizado.');
  };

  const updatePersonnel = (id: string, updates: Partial<PersonnelClosingItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      personnel: prev.personnel.map((p) => {
        if (p.id === id) {
          const item = { ...p, ...updates };
          item.diferenca = Number((item.valorProcessado - item.valorContabilizado).toFixed(2));
          return item;
        }
        return p;
      }),
    }));
    showToast('Rubrica de pessoal atualizada.');
  };

  const updateRelatedParty = (id: string, updates: Partial<RelatedPartyItem>) => {
    setExerciseData((prev) => ({
      ...prev,
      relatedParties: prev.relatedParties.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    showToast('Parte relacionada atualizada.');
  };

  const addDocument = (doc: Omit<DocumentRecord, 'id'>) => {
    const id = `doc-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      documents: [{ ...doc, id }, ...prev.documents],
    }));
    showToast(`Documento "${doc.nome}" associado com sucesso.`);
  };

  const deleteDocument = (id: string) => {
    deleteDocumentFileFromIndexedDB(id).catch((err) => console.warn('Erro ao apagar ficheiro do IndexedDB:', err));
    setExerciseData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
    showToast('Documento desassociado.');
  };

  const addDocumentWithFile = async (
    doc: Omit<DocumentRecord, 'id'>,
    file?: { name: string; type: string; size: number; base64: string }
  ) => {
    const id = `doc-${Date.now()}`;
    if (file) {
      try {
        await saveDocumentFileToIndexedDB({
          id,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          dataBase64: file.base64,
          uploadedAt: new Date().toISOString(),
          exercicio: currentYear,
          companyId: currentCompany.id,
        });
      } catch (e) {
        console.error('Falha ao gravar ficheiro no IndexedDB:', e);
      }
    }

    setExerciseData((prev) => ({
      ...prev,
      documents: [{ ...doc, id, fileStoredInIndexedDB: Boolean(file) }, ...prev.documents],
    }));
    showToast(`Documento "${doc.nome}" guardado localmente em IndexedDB.`, 'success');
  };

  const downloadDocumentFile = async (id: string, filename: string): Promise<boolean> => {
    try {
      const stored = await getDocumentFileFromIndexedDB(id);
      if (!stored || !stored.dataBase64) {
        showToast('Ficheiro não encontrado no armazenamento local deste dispositivo.', 'info');
        return false;
      }

      const a = document.createElement('a');
      const href = stored.dataBase64.startsWith('data:')
        ? stored.dataBase64
        : `data:${stored.mimeType || 'application/octet-stream'};base64,${stored.dataBase64}`;
      a.href = href;
      a.download = filename || stored.name || 'documento';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`A descarregar "${filename}" do armazenamento local.`);
      return true;
    } catch (err) {
      console.error('Erro ao transferir ficheiro:', err);
      showToast('Erro ao aceder ao ficheiro no IndexedDB.', 'error');
      return false;
    }
  };

  const exportBackup = async () => {
    try {
      const blob = await exportCompleteBackup(companies, exerciseStore);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Backup_Encerramento_Fiscal_PT_${dateStr}.json`;
      triggerFileDownload(blob, filename);
      showToast('Cópia de segurança completa exportada com sucesso.', 'success');
    } catch (err) {
      console.error('Erro ao exportar backup:', err);
      showToast('Falha ao exportar cópia de segurança.', 'error');
    }
  };

  const importBackup = async (fileContent: string): Promise<boolean> => {
    try {
      const result = await importCompleteBackup(fileContent);
      setCompanies(result.companies);
      setExerciseStore(result.exerciseStore);
      localStorage.setItem('enc_empresas_pt', JSON.stringify(result.companies));
      localStorage.setItem('enc_exercicios_store_pt', JSON.stringify(result.exerciseStore));
      showToast(
        `Backup restaurado com sucesso: ${result.companies.length} empresas e ${result.filesCount} ficheiros restaurados.`,
        'success'
      );
      return true;
    } catch (err: any) {
      console.error('Erro ao importar backup:', err);
      showToast(err.message || 'Erro ao restaurar backup.', 'error');
      return false;
    }
  };

  const updateTask = (id: string, updates: Partial<ChecklistTask>) => {
    setExerciseData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    showToast('Tarefa atualizada.');
  };

  const addTask = (task: Omit<ChecklistTask, 'id'>) => {
    const id = `tsk-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id }],
    }));
    showToast('Tarefa adicionada à checklist.');
  };

  const deleteTask = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    showToast('Tarefa removida.');
  };

  const updateQuestion = (id: string, updates: Partial<PendingQuestion>) => {
    setExerciseData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
    showToast('Questão pendente atualizada.');
  };

  const addQuestion = (q: Omit<PendingQuestion, 'id'>) => {
    const id = `q-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      questions: [{ ...q, id }, ...prev.questions],
    }));
    showToast('Nova questão registada.');
  };

  const deleteQuestion = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
    showToast('Questão removida.');
  };

  const addNote = (note: Omit<ClosingNote, 'id'>) => {
    const id = `not-${Date.now()}`;
    setExerciseData((prev) => ({
      ...prev,
      notes: [{ ...note, id }, ...prev.notes],
    }));
    showToast('Nota de encerramento registada.');
  };

  const deleteNote = (id: string) => {
    setExerciseData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
    showToast('Nota removida.');
  };

  const toggleTwoStepReview = (enabled: boolean) => {
    setExerciseData((prev) => ({
      ...prev,
      twoStepReviewRequired: enabled,
    }));
    showToast(
      enabled
        ? 'Regra ativada: Um item só é considerado concluído após revisão.'
        : 'Regra de dupla revisão desativada.',
      'info'
    );
  };

  const closeCurrentExercise = (userName: string, justification?: string) => {
    setExerciseData((prev) => ({
      ...prev,
      closed: true,
      closedAt: new Date().toLocaleDateString('pt-PT'),
      closedBy: userName,
    }));
    addLog(
      'Dossier Fiscal',
      `Exercício fiscal fechado por ${userName}${justification ? ` (Justificação: ${justification})` : ''}`
    );
    showToast(`O exercício de ${currentYear} foi fechado com sucesso!`, 'success');
  };

  const reopenCurrentExercise = (userName: string) => {
    setExerciseData((prev) => ({
      ...prev,
      closed: false,
      closedAt: undefined,
      closedBy: undefined,
    }));
    addLog('Dossier Fiscal', `Exercício fiscal reaberto por ${userName}`);
    showToast(`O exercício de ${currentYear} foi reaberto para edição.`, 'info');
  };

  const openAssistant = (prompt?: string, action?: string) => {
    setAssistantInitialPrompt(prompt || '');
    setAssistantInitialAction(action || '');
    setIsAssistantOpen(true);
  };

  const closeAssistant = () => setIsAssistantOpen(false);

  return (
    <AppContext.Provider
      value={{
        companies,
        currentCompany,
        currentYear,
        availableYears,
        exerciseData,
        progress,
        selectCompany,
        selectYear,
        addCompany,
        updateCompany,
        activeView,
        setActiveView,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,

        isAuditModalOpen,
        openAuditModal: () => setIsAuditModalOpen(true),
        closeAuditModal: () => setIsAuditModalOpen(false),

        isAssistantOpen,
        assistantInitialPrompt,
        assistantInitialAction,
        openAssistant,
        closeAssistant,

        isSearchModalOpen,
        openSearchModal: () => setIsSearchModalOpen(true),
        closeSearchModal: () => setIsSearchModalOpen(false),

        isDocRequestModalOpen,
        openDocRequestModal: () => setIsDocRequestModalOpen(true),
        closeDocRequestModal: () => setIsDocRequestModalOpen(false),

        isCloseExerciseModalOpen,
        openCloseExerciseModal: () => setIsCloseExerciseModalOpen(true),
        closeCloseExerciseModal: () => setIsCloseExerciseModalOpen(false),

        updateAccount,
        addAccount,
        deleteAccount,
        updateAccrual,
        addAccrual,
        deleteAccrual,
        updateAsset,
        addAsset,
        deleteAsset,
        updateInventory,
        updateSubsidy,
        addSubsidy,
        deleteSubsidy,
        updateInternalWork,
        addInternalWork,
        deleteInternalWork,
        updateAutonomousTax,
        addAutonomousTax,
        deleteAutonomousTax,
        updateIrcCalculation,
        addTaxCorrection,
        deleteTaxCorrection,
        updateTaxBenefit,
        addTaxBenefit,
        deleteTaxBenefit,
        updateFinancialStatement,
        updateTaxObligation,
        updateImpairment,
        addImpairment,
        deleteImpairment,
        updateBank,
        updateThirdParty,
        updatePersonnel,
        updateRelatedParty,
        addDocument,
        deleteDocument,
        addDocumentWithFile,
        downloadDocumentFile,
        isIndexedDbReady,
        exportBackup,
        importBackup,
        updateTask,
        addTask,
        deleteTask,
        updateQuestion,
        addQuestion,
        deleteQuestion,
        addNote,
        deleteNote,
        toggleTwoStepReview,
        closeCurrentExercise,
        reopenCurrentExercise,

        toasts,
        removeToast,
        showToast,
        attentionItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
