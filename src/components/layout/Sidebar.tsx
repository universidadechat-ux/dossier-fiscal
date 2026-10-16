import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calculator,
  Scale,
  FolderArchive,
  FileSpreadsheet,
  CheckSquare,
  AlertCircle,
  HelpCircle,
  FileText,
  Settings,
  History,
  Coins,
  TrendingDown,
  Building2,
  Package,
  Layers,
  Wrench,
  Landmark,
  Users2,
  UserCheck,
  FileSearch,
  Lock,
  GitCompare,
  Percent,
  X,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    exerciseData,
    currentYear,
    currentCompany,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useApp();

  const diffAccountsCount = exerciseData.accounts.filter(
    (a) => Math.abs(a.diferenca) > 0.01
  ).length;

  const openQuestionsCount = exerciseData.questions.filter(
    (q) => q.estado !== 'resolvido'
  ).length;

  const unreviewedTACount = exerciseData.autonomousTaxes.filter(
    (t) => !t.revisto
  ).length;

  const pendingTasksCount = exerciseData.tasks.filter(
    (t) => t.estado !== 'concluido'
  ).length;

  const navSectionClass = 'px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mt-4 mb-1';
  const navItemClass = (id: string) =>
    `flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
      activeView === id
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand & Status */}
      <div className="p-4 border-b border-slate-200 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight">
            EF
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Encerramento & Dossier
            </h1>
            <p className="text-[11px] text-slate-500">SNC & Fiscalidade PT</p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {exerciseData.closed && (
        <div className="mx-3 mt-3 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-amber-800 text-xs">
          <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-medium truncate">Exercício {currentYear} Fechado</span>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 text-xs">
        {/* Dashboard */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={navItemClass('dashboard')}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard Principal</span>
          </div>
        </button>

        {/* 1. ENCERRAMENTO CONTABILÍSTICO */}
        <div className={navSectionClass}>1. Encerramento Contabilístico</div>

        <button
          onClick={() => setActiveView('conferencia_contas')}
          className={navItemClass('conferencia_contas')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Scale className="w-4 h-4 shrink-0" />
            <span className="truncate">Conferência de Contas</span>
          </div>
          {diffAccountsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-rose-100 text-rose-700 rounded tabular-nums">
              {diffAccountsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('acrescimos')}
          className={navItemClass('acrescimos')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <TrendingDown className="w-4 h-4 shrink-0" />
            <span className="truncate">Acréscimos e Diferimentos</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('ativos')}
          className={navItemClass('ativos')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Gestão de Ativos</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('inventarios')}
          className={navItemClass('inventarios')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Package className="w-4 h-4 shrink-0" />
            <span className="truncate">Inventários</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('subsidios')}
          className={navItemClass('subsidios')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Coins className="w-4 h-4 shrink-0" />
            <span className="truncate">Subsídios</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('trabalhos_propria_empresa')}
          className={navItemClass('trabalhos_propria_empresa')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">Trabalhos Própria Empresa</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('imparidades')}
          className={navItemClass('imparidades')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Imparidades e Provisões</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('bancos')}
          className={navItemClass('bancos')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Landmark className="w-4 h-4 shrink-0" />
            <span className="truncate">Bancos e Financiamentos</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('terceiros')}
          className={navItemClass('terceiros')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Users2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Clientes e Fornecedores</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('pessoal')}
          className={navItemClass('pessoal')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Pessoal e Remunerações</span>
          </div>
        </button>

        {/* 2. ENCERRAMENTO FISCAL */}
        <div className={navSectionClass}>2. Encerramento Fiscal</div>

        <button
          onClick={() => setActiveView('calculo_irc')}
          className={navItemClass('calculo_irc')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Calculator className="w-4 h-4 shrink-0" />
            <span className="truncate font-medium">Cálculo de IRC (M22)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('tributacoes_autonomas')}
          className={navItemClass('tributacoes_autonomas')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Percent className="w-4 h-4 shrink-0" />
            <span className="truncate">Tributações Autónomas</span>
          </div>
          {unreviewedTACount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded tabular-nums">
              {unreviewedTACount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('beneficios_fiscais')}
          className={navItemClass('beneficios_fiscais')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Coins className="w-4 h-4 shrink-0" />
            <span className="truncate">Benefícios Fiscais</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('partes_relacionadas')}
          className={navItemClass('partes_relacionadas')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">Partes Relacionadas</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('obrigacoes_at')}
          className={navItemClass('obrigacoes_at')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">AT / Obrigações Fiscais</span>
          </div>
        </button>

        {/* 3. DOSSIER FISCAL */}
        <div className={navSectionClass}>3. Dossier Fiscal</div>

        <button
          onClick={() => setActiveView('dossier_checklist')}
          className={navItemClass('dossier_checklist')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Checklist do Dossier</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('documentos')}
          className={navItemClass('documentos')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <FolderArchive className="w-4 h-4 shrink-0" />
            <span className="truncate">Documentos & Arquivo</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('demonstracoes_financeiras')}
          className={navItemClass('demonstracoes_financeiras')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="truncate">Demonstrações Financeiras</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('notas_encerramento')}
          className={navItemClass('notas_encerramento')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <FileSearch className="w-4 h-4 shrink-0" />
            <span className="truncate">Notas de Encerramento</span>
          </div>
        </button>

        {/* CONTROLO E REVISÃO */}
        <div className={navSectionClass}>Controlo & Revisão</div>

        <button
          onClick={() => setActiveView('pendentes')}
          className={navItemClass('pendentes')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Pendentes Globais</span>
          </div>
          {pendingTasksCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded tabular-nums">
              {pendingTasksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('questoes')}
          className={navItemClass('questoes')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Questões Pendentes</span>
          </div>
          {openQuestionsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded tabular-nums">
              {openQuestionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('comparacao')}
          className={navItemClass('comparacao')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <GitCompare className="w-4 h-4 shrink-0" />
            <span className="truncate">Comparação de Exercícios</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('relatorio')}
          className={navItemClass('relatorio')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate font-medium">Relatório de Encerramento</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('configuracoes')}
          className={navItemClass('configuracoes')}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Settings className="w-4 h-4 shrink-0" />
            <span className="truncate">Configurações & Empresas</span>
          </div>
        </button>
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate font-medium text-slate-700">
            {currentCompany.responsavelPrincipal.split(' ')[0]} {currentCompany.responsavelPrincipal.split(' ')[1] || ''}
          </span>
          <span className="font-mono text-slate-400">v2.6 PT</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visível em ecrãs largos) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen shrink-0 select-none">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer (visível em ecrãs móveis quando aberto) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-white h-full shadow-2xl z-10 select-none">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
