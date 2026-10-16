import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  X,
  Scale,
  FolderArchive,
  Building2,
  Users2,
  CheckSquare,
  HelpCircle,
  FileSearch,
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchModalOpen, closeSearchModal, exerciseData, setActiveView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isSearchModalOpen) {
          closeSearchModal();
        } else {
          // Open handled by context
        }
      } else if (e.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, closeSearchModal]);

  const results = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();

    const accounts = exerciseData.accounts.filter(
      (a) =>
        a.codigoConta.toLowerCase().includes(term) ||
        a.descricao.toLowerCase().includes(term) ||
        a.area.toLowerCase().includes(term)
    );

    const documents = exerciseData.documents.filter(
      (d) =>
        d.nome.toLowerCase().includes(term) ||
        d.categoria.toLowerCase().includes(term) ||
        d.observacoes.toLowerCase().includes(term)
    );

    const assets = exerciseData.assets.filter(
      (ast) =>
        ast.numeroAtivo.toLowerCase().includes(term) ||
        ast.descricao.toLowerCase().includes(term) ||
        ast.categoria.toLowerCase().includes(term)
    );

    const thirdParties = exerciseData.thirdParties.filter(
      (tp) =>
        tp.entidade.toLowerCase().includes(term) ||
        tp.nif.toLowerCase().includes(term) ||
        tp.observacoes.toLowerCase().includes(term)
    );

    const tasks = exerciseData.tasks.filter(
      (t) =>
        t.descricao.toLowerCase().includes(term) ||
        t.area.toLowerCase().includes(term) ||
        t.responsavel.toLowerCase().includes(term)
    );

    const questions = exerciseData.questions.filter(
      (q) =>
        q.questao.toLowerCase().includes(term) ||
        q.area.toLowerCase().includes(term) ||
        (q.resposta && q.resposta.toLowerCase().includes(term))
    );

    const notes = exerciseData.notes.filter(
      (n) =>
        n.assunto.toLowerCase().includes(term) ||
        n.descricao.toLowerCase().includes(term)
    );

    const totalCount =
      accounts.length +
      documents.length +
      assets.length +
      thirdParties.length +
      tasks.length +
      questions.length +
      notes.length;

    return {
      accounts,
      documents,
      assets,
      thirdParties,
      tasks,
      questions,
      notes,
      totalCount,
    };
  }, [searchTerm, exerciseData]);

  if (!isSearchModalOpen) return null;

  const navigateTo = (view: string) => {
    setActiveView(view);
    closeSearchModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar contas, faturas, documentos, fornecedores, tarefas, questões..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={closeSearchModal}
            className="px-2 py-0.5 text-xs text-slate-400 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-100"
          >
            Esc
          </kbd>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!searchTerm.trim() ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Escreva termos como <span className="text-slate-600 font-mono">"Mercedes"</span>,{' '}
              <span className="text-slate-600 font-mono">"Santander"</span>,{' '}
              <span className="text-slate-600 font-mono">"21.1"</span>,{' '}
              <span className="text-slate-600 font-mono">"Férias"</span> ou{' '}
              <span className="text-slate-600 font-mono">"IVA"</span> para pesquisar em toda a empresa.
            </div>
          ) : results && results.totalCount === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Nenhum registo encontrado para "{searchTerm}".
            </div>
          ) : results ? (
            <>
              {/* Contas */}
              {results.accounts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Contas Contabilísticas ({results.accounts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.accounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => navigateTo('conferencia_contas')}
                        className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {acc.codigoConta} — {acc.descricao}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Área: {acc.area} · Responsável: {acc.responsavel}
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(acc.saldoContabilistico)}
                          </span>
                          {Math.abs(acc.diferenca) > 0.01 && (
                            <span className="block text-rose-600 text-[10px]">
                              Dif: {formatCurrency(acc.diferenca)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentos */}
              {results.documents.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>Documentos & Ficheiros ({results.documents.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.documents.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => navigateTo('documentos')}
                        className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{doc.nome}</div>
                          <div className="text-[11px] text-slate-500">
                            {doc.categoria} · Data: {doc.data} · Autor: {doc.autor}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{doc.tamanho}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ativos */}
              {results.assets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Ativos Fixos ({results.assets.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.assets.map((ast) => (
                      <div
                        key={ast.id}
                        onClick={() => navigateTo('ativos')}
                        className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            [{ast.numeroAtivo}] {ast.descricao}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Categoria: {ast.categoria} · Adquirido em: {ast.dataAquisicao}
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs font-semibold text-slate-800">
                          {formatCurrency(ast.valorAquisicao)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terceiros */}
              {results.thirdParties.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Users2 className="w-3.5 h-3.5" />
                    <span>Clientes e Fornecedores ({results.thirdParties.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.thirdParties.map((tp) => (
                      <div
                        key={tp.id}
                        onClick={() => navigateTo('terceiros')}
                        className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{tp.entidade}</div>
                          <div className="text-[11px] text-slate-500">
                            NIF: {tp.nif} · {tp.tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}
                          </div>
                        </div>
                        <div className="font-mono text-xs font-semibold text-slate-800">
                          {formatCurrency(tp.saldo)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarefas e Questões */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Tarefas ({results.tasks.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((tsk) => (
                      <div
                        key={tsk.id}
                        onClick={() => navigateTo('pendentes')}
                        className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200"
                      >
                        <div className="text-xs text-slate-800">{tsk.descricao}</div>
                        <span className="text-[11px] text-slate-500">{tsk.area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.questions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Questões Fiscais e Contabilísticas ({results.questions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.questions.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => navigateTo('questoes')}
                        className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="text-xs font-medium text-slate-800">{q.questao}</div>
                        <div className="text-[11px] text-slate-500">
                          Área: {q.area} · Responsável: {q.responsavel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.notes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Notas de Encerramento ({results.notes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.notes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => navigateTo('notas_encerramento')}
                        className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="text-xs font-semibold text-slate-800">{n.assunto}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{n.descricao}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
