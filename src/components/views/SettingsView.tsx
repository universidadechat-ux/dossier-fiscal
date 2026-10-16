import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNIF } from '../../utils/formatters';
import { Company } from '../../types';
import {
  Settings,
  Building2,
  Plus,
  Edit2,
  Check,
  ShieldCheck,
  History,
  ToggleLeft,
  ToggleRight,
  FileText,
  Monitor,
  HardDrive,
  Download,
  Upload,
  Database,
  RefreshCcw,
  FileArchive,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    companies,
    currentCompany,
    addCompany,
    updateCompany,
    selectCompany,
    exerciseData,
    toggleTwoStepReview,
    currentYear,
    showToast,
    exportBackup,
    importBackup,
    isIndexedDbReady,
  } = useApp();

  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      await exportBackup();
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (
        window.confirm(
          'Tem a certeza de que pretende restaurar esta cópia de segurança? Os dados de empresas e exercícios serão atualizados com as informações do ficheiro.'
        )
      ) {
        await importBackup(content);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [newComp, setNewComp] = useState<Partial<Company>>({
    name: '',
    nif: '',
    cae: '62010',
    regimeIrc: 'PME',
    regimeIva: 'Trimestral',
    dataInicioAtividade: `01/01/${currentYear}`,
    exercicioAtivo: currentYear,
    responsavelPrincipal: 'Contabilista Certificado',
    revisor: '',
    observacoes: '',
  });

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComp.name || !newComp.nif) {
      showToast('Preencha a designação social e o NIF da empresa.', 'error');
      return;
    }

    addCompany(newComp);
    setIsAddCompanyOpen(false);
    setNewComp({
      name: '',
      nif: '',
      cae: '62010',
      regimeIrc: 'PME',
      regimeIva: 'Trimestral',
      dataInicioAtividade: `01/01/${currentYear}`,
      exercicioAtivo: currentYear,
      responsavelPrincipal: 'Contabilista Certificado',
      revisor: '',
      observacoes: '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    updateCompany(editingCompany.id, editingCompany);
    setEditingCompany(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Administração do Sistema
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>Configurações & Gestão de Empresas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de entidades empresariais portuguesas, parametrização de regimes tributários e regras de controlo de encerramento.
          </p>
        </div>

        <button
          onClick={() => setIsAddCompanyOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Empresa</span>
        </button>
      </div>

      {/* Regra de Duplo Controlo (Secção 27) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Regra de Duplo Controlo: Preparado Por / Revisto Por
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                "Um item só pode ser considerado totalmente concluído depois de revisto por utilizador credenciado (ROC ou Contabilista Sénior)."
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleTwoStepReview(!exerciseData.twoStepReviewRequired)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <span>{exerciseData.twoStepReviewRequired ? 'Ativada' : 'Desativada'}</span>
            {exerciseData.twoStepReviewRequired ? (
              <ToggleRight className="w-8 h-8 text-indigo-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Lista de Empresas Cadastradas (Secção 2) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Empresas Geridas na Aplicação ({companies.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => {
            const isSelected = comp.id === currentCompany.id;
            return (
              <div
                key={comp.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-xs ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      NIF: {formatNIF(comp.nif)}
                    </span>
                    <button
                      onClick={() => setEditingCompany(comp)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                      title="Editar dados da empresa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{comp.name}</h4>
                  <div className="text-[11px] text-slate-500 space-y-0.5 mt-2">
                    <p>CAE: {comp.cae}</p>
                    <p>Regime IRC: {comp.regimeIrc} · IVA {comp.regimeIva}</p>
                    <p>Início Atividade: {comp.dataInicioAtividade}</p>
                    <p className="truncate">CC: {comp.responsavelPrincipal}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                  {isSelected ? (
                    <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Empresa Ativa</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => selectCompany(comp.id)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      Selecionar Empresa
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">Exercício {comp.exercicioAtivo}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sistema de Backup & Restauro Local (Requisitos 8, 9, 10) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cópia de Segurança & Restauro de Dados
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exporte ou importe a totalidade da informação contabilística, fiscal e documental.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Backup</span>
            </button>

            <button
              onClick={handleImportClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar Backup</span>
            </button>

            {/* Input invisível para carregamento do ficheiro JSON de backup */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Mensagem Obrigatória em Destaque */}
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-950">
          <HardDrive className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold block sm:inline">
              Os dados desta aplicação são armazenados localmente neste dispositivo.
            </span>{' '}
            <span className="text-emerald-800">
              A base de dados IndexedDB mantém os registos no computador sem depender de ligação à Internet ou servidores externos.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            {isIndexedDbReady ? 'IndexedDB Pronto' : 'A sincronizar...'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-semibold text-slate-800 block">Como funciona o "Exportar Backup"?</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Gera um ficheiro <code>.json</code> completo que inclui as empresas registadas, todos os exercícios fiscais, demonstrações financeiras, histórico de auditoria e os documentos armazenados. Pode guardar este ficheiro numa pen-drive ou pasta de arquivo.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-semibold text-slate-800 block">Como funciona o "Importar Backup"?</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Permite restaurar todos os dados da aplicação num novo computador ou navegador, repondo integralmente as empresas e o estado dos encerramentos.
            </p>
          </div>
        </div>
      </div>

      {/* Utilização Offline & Instalação no Computador */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Utilização Offline & Aplicação no Computador (PC / Mac)
            </h3>
          </div>
          <PWAInstallButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>Armazenamento Local (100% Offline)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Todos os registos contabilísticos, reconciliações de contas, apuramento de IRC, notas e configurações ficam armazenados de forma persistente no disco local do seu computador.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Instalar como App no PC (PWA)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pode instalar esta aplicação diretamente através do browser (Chrome, Edge ou Brave). Abre numa janela independente sem barras de endereço e cria atalho no Ambiente de Trabalho.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Executável Nativo (.exe)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              A arquitetura React + TypeScript é compatível com Electron ou Tauri para compilar diretamente num executável <code>.exe</code> distribuível e portátil para pen-drives ou redes privadas.
            </p>
          </div>
        </div>
      </div>

      {/* Histórico Permanente de Alterações (Secção 27) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Histórico Permanente de Alterações & Auditoria
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-2.5">Data & Hora</th>
                <th className="px-4 py-2.5">Utilizador</th>
                <th className="px-4 py-2.5">Área de Trabalho</th>
                <th className="px-4 py-2.5">Alteração Efetuada</th>
                <th className="px-4 py-2.5">Valor Anterior</th>
                <th className="px-4 py-2.5">Novo Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exerciseData.history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Sem registos de histórico para este exercício fiscal.
                  </td>
                </tr>
              ) : (
                exerciseData.history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">{h.timestamp}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">{h.utilizador}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{h.area}</td>
                    <td className="px-4 py-2.5 text-slate-800">{h.alteracaoEfetuada}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-400">{h.valorAnterior || '—'}</td>
                    <td className="px-4 py-2.5 font-mono font-medium text-emerald-700">{h.novoValor || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Empresa */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Adicionar Nova Empresa</h3>
              <button onClick={() => setIsAddCompanyOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateCompany} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome / Firma Social *</label>
                <input
                  type="text"
                  placeholder="Ex: Lusitânia Logística, S.A."
                  value={newComp.name}
                  onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIF (9 dígitos PT) *</label>
                  <input
                    type="text"
                    placeholder="Ex: 508123456"
                    value={newComp.nif}
                    onChange={(e) => setNewComp({ ...newComp, nif: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CAE Principal</label>
                  <input
                    type="text"
                    placeholder="Ex: 62010"
                    value={newComp.cae}
                    onChange={(e) => setNewComp({ ...newComp, cae: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regime de IRC</label>
                  <select
                    value={newComp.regimeIrc}
                    onChange={(e) => setNewComp({ ...newComp, regimeIrc: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Geral">Regime Geral</option>
                    <option value="PME">PME (Taxa Reduzida 17%)</option>
                    <option value="Pequena Empresa">Pequena Empresa</option>
                    <option value="Isenção">Isenção Subjetiva</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Periodicidade de IVA</label>
                  <select
                    value={newComp.regimeIva}
                    onChange={(e) => setNewComp({ ...newComp, regimeIva: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Trimestral">Trimestral</option>
                    <option value="Mensal">Mensal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Responsável Principal (Contabilista)</label>
                <input
                  type="text"
                  value={newComp.responsavelPrincipal}
                  onChange={(e) => setNewComp({ ...newComp, responsavelPrincipal: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Criar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Empresa */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Editar Empresa — {editingCompany.name}</h3>
              <button onClick={() => setEditingCompany(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome / Firma Social</label>
                <input
                  type="text"
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regime de IRC</label>
                  <select
                    value={editingCompany.regimeIrc}
                    onChange={(e) => setEditingCompany({ ...editingCompany, regimeIrc: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Geral">Regime Geral</option>
                    <option value="PME">PME</option>
                    <option value="Pequena Empresa">Pequena Empresa</option>
                    <option value="Isenção">Isenção</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Periodicidade de IVA</label>
                  <select
                    value={editingCompany.regimeIva}
                    onChange={(e) => setEditingCompany({ ...editingCompany, regimeIva: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Trimestral">Trimestral</option>
                    <option value="Mensal">Mensal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Responsável Principal</label>
                <input
                  type="text"
                  value={editingCompany.responsavelPrincipal}
                  onChange={(e) => setEditingCompany({ ...editingCompany, responsavelPrincipal: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Revisor / ROC</label>
                <input
                  type="text"
                  value={editingCompany.revisor}
                  onChange={(e) => setEditingCompany({ ...editingCompany, revisor: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Guardar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
