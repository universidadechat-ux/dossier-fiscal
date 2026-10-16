import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatNIF } from '../../utils/formatters';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Building,
  Calendar,
  Search,
  Sparkles,
  ClipboardCheck,
  Send,
  Lock,
  Unlock,
  ChevronDown,
  Menu,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    companies,
    currentCompany,
    currentYear,
    availableYears,
    selectCompany,
    selectYear,
    openSearchModal,
    openAuditModal,
    openAssistant,
    openDocRequestModal,
    openCloseExerciseModal,
    reopenCurrentExercise,
    exerciseData,
    toggleMobileSidebar,
  } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shrink-0 select-none">
      {/* Zone 1: Menu móvel e Selectores de Empresa e Exercício Fiscal */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Botão de Menu para ecrãs móveis */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer"
          aria-label="Abrir menu"
          title="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Seletor de Empresa */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-slate-300 transition-colors">
          <Building className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
              Empresa
            </span>
            <select
              value={currentCompany.id}
              onChange={(e) => selectCompany(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 max-w-[115px] sm:max-w-[200px] md:max-w-none truncate"
            >
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} ({formatNIF(comp.nif)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Seletor de Exercício Fiscal */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-slate-300 transition-colors">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
              Exercício
            </span>
            <select
              value={currentYear}
              onChange={(e) => selectYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1 font-mono"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Regime Tributário */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 px-2">
          <span>{currentCompany.regimeIrc}</span>
          <span aria-hidden="true">·</span>
          <span>IVA {currentCompany.regimeIva}</span>
        </div>
      </div>

      {/* Zone 2: Pesquisa Global (expandida em ecrãs médios/largos) */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <button
          onClick={openSearchModal}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Pesquisar contas, faturas, documentos, fornecedores...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400 shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Ações de Destaque */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Pesquisa móvel em ecrãs pequenos */}
        <button
          onClick={openSearchModal}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Pesquisar"
          title="Pesquisa global (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Botão de Destaque: Analisar Encerramento (Secção 28) */}
        <button
          onClick={openAuditModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          title="Pré-revisão automática do encerramento"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Analisar Encerramento</span>
        </button>

        {/* Botão: Pedir Documentação */}
        <button
          onClick={openDocRequestModal}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          title="Gerar email de pedido de documentação ao cliente"
        >
          <Send className="w-3.5 h-3.5 text-blue-600" />
          <span>Pedir Documentos</span>
        </button>

        {/* Assistente do Encerramento (IA) */}
        <button
          onClick={() => openAssistant()}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden xs:inline">Assistente IA</span>
        </button>

        {/* Instalar App no PC / Offline */}
        <div className="hidden sm:block">
          <PWAInstallButton />
        </div>

        {/* Fechar Exercício / Estado de Fecho */}
        {exerciseData.closed ? (
          <button
            onClick={() => {
              if (window.confirm('Deseja reabrir o exercício fiscal para correções?')) {
                reopenCurrentExercise('Contabilista');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
            title="Exercício Fechado. Clique para reabrir."
          >
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Fechado</span>
          </button>
        ) : (
          <button
            onClick={openCloseExerciseModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Validar e fechar o exercício"
          >
            <Unlock className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Fechar Exercício</span>
          </button>
        )}
      </div>
    </header>
  );
};
