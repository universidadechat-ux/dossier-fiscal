import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Monitor, CheckCircle2, X, HardDrive, WifiOff, Terminal, Sparkles } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      {isInstalled ? (
        <button
          onClick={() => setShowGuide(true)}
          className={`flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer ${
            compact ? 'p-1.5' : 'px-2.5 py-1.5'
          }`}
          title="Aplicação instalada no PC / Dispositivo. Clique para ver detalhes de funcionamento offline."
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {!compact && <span className="font-medium">Instalada no PC</span>}
        </button>
      ) : isInstallable ? (
        <button
          onClick={install}
          className={`flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer animate-pulse ${
            compact ? 'p-1.5' : 'px-3 py-1.5'
          }`}
          title="Instalar no PC como aplicação nativa independente (PWA com ícone no ambiente de trabalho)"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          {!compact && <span>Instalar no PC</span>}
        </button>
      ) : (
        <button
          onClick={() => setShowGuide(true)}
          className={`flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors cursor-pointer ${
            compact ? 'p-1.5' : 'px-2.5 py-1.5'
          }`}
          title="Informações de utilização Offline e como instalar como Executável (.exe) / App no PC"
        >
          <Monitor className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          {!compact && <span className="hidden sm:inline">Instalar / Offline</span>}
        </button>
      )}

      {/* Modal Explicativo: Instalação no PC e Utilização Offline */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-base shadow-sm">
                  EF
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Utilização Offline & Aplicação no PC
                  </h3>
                  <p className="text-xs text-slate-300">
                    Instalação direta no Windows/Mac e opções de Executável (.exe)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs leading-relaxed">
              {/* Opção 1: Instalação PWA (Recomendada e Imediata) */}
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-indigo-950 font-bold text-sm">
                  <Monitor className="w-4 h-4 text-indigo-600" />
                  <span>Opção 1: Instalar como App no PC (Recomendado — Sem Instalar Programas Externos)</span>
                </div>
                <p className="text-slate-600 mb-3">
                  Esta aplicação está configurada como <strong>Progressive Web App (PWA)</strong>. Pode ser instalada diretamente no seu computador (Windows, macOS ou Linux):
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 ml-1">
                  <li><strong>Ícone no Ambiente de Trabalho</strong> e no Menu Iniciar do Windows.</li>
                  <li><strong>Janela própria</strong> sem barras de navegação do browser (comportamento de aplicação nativa).</li>
                  <li><strong>Acesso 100% Offline</strong>: Os dados ficam guardados no seu computador em <code>localStorage</code> e o Service Worker carrega toda a interface mesmo sem ligação à Internet.</li>
                </ul>
                <div className="mt-3.5 pt-3 border-t border-indigo-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    No Chrome/Edge: clique no ícone de instalar na barra de endereço ou use o botão:
                  </span>
                  {isInstallable && (
                    <button
                      onClick={() => {
                        install();
                        setShowGuide(false);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Instalar Agora
                    </button>
                  )}
                </div>
              </div>

              {/* Como Funciona o Modo Offline */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-sm">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  <span>Como Funciona o Modo Offline</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Armazenamento Local Seguro</span>
                    <p className="text-[11px] text-slate-600">
                      Todos os balancetes, reconciliações de contas, notas de encerramento, empresas e o apuramento de IRC ficam gravados localmente no seu computador.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Funcionalidades Sem Internet</span>
                    <p className="text-[11px] text-slate-600">
                      Cálculos de IRC, tributações autónomas, checklists de dossier fiscal, conferência de contas e exportação de relatórios funcionam sem rede. Apenas o Assistente IA requer ligação ativa à API.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opção 2: Gerar Executável Nativo (.exe) para Windows */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-sm">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  <span>Opção 2: Compilar como Executável Nativo (.exe) com Electron ou Tauri</span>
                </div>
                <p className="text-slate-600 mb-2">
                  Se necessitar de um instalador <code>setup.exe</code> ou ficheiro portátil <code>.exe</code> distribuível para pen drives ou redes corporativas:
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div className="text-slate-400"># 1. Empacotar com Electron (ou Tauri):</div>
                  <div>npm install -D electron electron-builder</div>
                  <div>npm run build && npx electron-builder --win</div>
                  <div className="text-emerald-400 pt-1"># Gera o executável: dist/EncerramentoFiscal-Setup-2026.exe</div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  O projeto é 100% standard React + Vite + TypeScript, permitindo ser empacotado em qualquer wrapper desktop sem modificações no código da lógica de negócio.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
