import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClosingNote } from '../../types';
import { FileSearch, Plus, Trash2, Calendar, UserCheck, ShieldCheck } from 'lucide-react';

export const ClosingNotesView: React.FC = () => {
  const {
    exerciseData,
    addNote,
    deleteNote,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNote, setNewNote] = useState<Partial<ClosingNote>>({
    data: new Date().toLocaleDateString('pt-PT'),
    assunto: '',
    descricao: '',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    conta: '',
    impactoContabilistico: '',
    impactoFiscal: '',
    conclusao: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.assunto || !newNote.descricao) {
      showToast('Preencha o assunto e a descrição da deliberação.', 'error');
      return;
    }

    addNote({
      data: newNote.data || new Date().toLocaleDateString('pt-PT'),
      assunto: newNote.assunto,
      descricao: newNote.descricao,
      responsavel: newNote.responsavel || 'Contabilista',
      conta: newNote.conta || '',
      impactoContabilistico: newNote.impactoContabilistico || '',
      impactoFiscal: newNote.impactoFiscal || '',
      conclusao: newNote.conclusao || '',
    });

    setIsAddModalOpen(false);
    setNewNote({
      data: new Date().toLocaleDateString('pt-PT'),
      assunto: '',
      descricao: '',
      responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
      conta: '',
      impactoContabilistico: '',
      impactoFiscal: '',
      conclusao: '',
    });
  };

  const handleDelete = (id: string, assunto: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar a nota de encerramento "${assunto}"?`)) {
      deleteNote(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            3. Dossier Fiscal
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-indigo-600" />
            <span>Notas de Encerramento & Decisões Contabilísticas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registo formal e permanente das deliberações de fecho de contas, políticas contabilísticas adotadas e critérios de julgamento fiscal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Nota de Encerramento</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {exerciseData.notes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
            Nenhuma nota de encerramento registada para o exercício de {currentYear}.
          </div>
        ) : (
          exerciseData.notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{note.assunto}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{note.data}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{note.responsavel}</span>
                    </span>
                    {note.conta && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-slate-600">Conta: {note.conta}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(note.id, note.assunto)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {note.descricao}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="border border-slate-200 rounded-lg p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Impacto Contabilístico
                  </span>
                  <span className="text-slate-800 font-medium block mt-0.5">
                    {note.impactoContabilistico || 'Sem impacto'}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Impacto Fiscal (IRC)
                  </span>
                  <span className="text-slate-800 font-medium block mt-0.5">
                    {note.impactoFiscal || 'Sem impacto'}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg p-2.5 bg-emerald-50/40 border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Conclusão do Revisor
                  </span>
                  <span className="text-emerald-900 font-medium block mt-0.5">
                    {note.conclusao || 'Deliberação validada.'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Adicionar */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Nova Nota de Encerramento</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assunto / Decisão *</label>
                <input
                  type="text"
                  placeholder="Ex: Critério de estimativa de garantias pós-venda"
                  value={newNote.assunto}
                  onChange={(e) => setNewNote({ ...newNote, assunto: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição e Justificação Técnica *</label>
                <textarea
                  rows={3}
                  value={newNote.descricao}
                  onChange={(e) => setNewNote({ ...newNote, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impacto Contabilístico</label>
                  <input
                    type="text"
                    value={newNote.impactoContabilistico}
                    onChange={(e) => setNewNote({ ...newNote, impactoContabilistico: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impacto Fiscal</label>
                  <input
                    type="text"
                    value={newNote.impactoFiscal}
                    onChange={(e) => setNewNote({ ...newNote, impactoFiscal: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conclusão / Deliberação</label>
                <input
                  type="text"
                  value={newNote.conclusao}
                  onChange={(e) => setNewNote({ ...newNote, conclusao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Gravar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
