import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PendingQuestion, Priority } from '../../types';
import { HelpCircle, Plus, Trash2, Edit2, CheckCircle2, Clock, FileText } from 'lucide-react';

export const PendingQuestionsView: React.FC = () => {
  const {
    exerciseData,
    updateQuestion,
    addQuestion,
    deleteQuestion,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [editingItem, setEditingItem] = useState<PendingQuestion | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newQ, setNewQ] = useState<Partial<PendingQuestion>>({
    questao: '',
    area: 'Fiscalidade / IRC',
    data: new Date().toLocaleDateString('pt-PT'),
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    prioridade: 'alta',
    estado: 'por_analisar',
    resposta: '',
    conclusao: '',
    documentoAssociado: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.questao) {
      showToast('Preencha o texto da questão.', 'error');
      return;
    }

    addQuestion({
      questao: newQ.questao,
      area: newQ.area || 'Geral',
      data: newQ.data || new Date().toLocaleDateString('pt-PT'),
      responsavel: newQ.responsavel || 'Contabilista',
      prioridade: (newQ.prioridade as Priority) || 'alta',
      estado: (newQ.estado as any) || 'por_analisar',
      resposta: newQ.resposta || '',
      conclusao: newQ.conclusao || '',
      documentoAssociado: newQ.documentoAssociado || '',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateQuestion(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDelete = (id: string, q: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar esta questão?`)) {
      deleteQuestion(id);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'resolvido':
        return { label: 'Resolvido', class: 'bg-emerald-100 text-emerald-800' };
      case 'aguarda_informacao':
        return { label: 'A aguardar informação', class: 'bg-amber-100 text-amber-800' };
      case 'por_analisar':
      default:
        return { label: 'Por analisar', class: 'bg-rose-100 text-rose-800' };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Controlo & Revisão
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span>Questões Pendentes & Dúvidas Técnicas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registo formal de dúvidas contabilísticas, fiscais e societárias com acompanhamento de resposta e conclusão do revisor.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Questão</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {exerciseData.questions.map((q) => {
          const st = getStatusBadge(q.estado);
          return (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${st.class}`}>
                      {st.label}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Área: {q.area}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">· {q.data}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{q.questao}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingItem(q)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id, q.questao)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {q.resposta ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-slate-800 block">Resposta / Análise Técnica:</span>
                  <p className="text-slate-700 leading-relaxed">{q.resposta}</p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  A aguardar parecer técnico ou clarificação documental.
                </div>
              )}

              {q.conclusao && (
                <div className="text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 font-medium">
                  <strong>Conclusão do Revisor:</strong> {q.conclusao}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Edição */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Responder / Concluir Questão</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Questão Formulada</label>
                <textarea
                  rows={2}
                  value={editingItem.questao}
                  onChange={(e) => setEditingItem({ ...editingItem, questao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={editingItem.estado}
                    onChange={(e) => setEditingItem({ ...editingItem, estado: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="por_analisar">Por analisar</option>
                    <option value="aguarda_informacao">A aguardar informação</option>
                    <option value="resolvido">Resolvido</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsável</label>
                  <input
                    type="text"
                    value={editingItem.responsavel}
                    onChange={(e) => setEditingItem({ ...editingItem, responsavel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resposta Técnica / Esclarecimento</label>
                <textarea
                  rows={3}
                  value={editingItem.resposta || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, resposta: e.target.value })}
                  placeholder="Introduza a resposta ou enquadramento com base na legislação aplicável..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conclusão Final</label>
                <input
                  type="text"
                  value={editingItem.conclusao || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, conclusao: e.target.value })}
                  placeholder="Ex: Regularização efetuada na contabilidade / Dedução autorizada"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Guardar Resposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Registar Nova Questão Técnica</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Questão / Dúvida *</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Confirmar se o seguro de saúde dos colaboradores é tributado em sede de TA..."
                  value={newQ.questao}
                  onChange={(e) => setNewQ({ ...newQ, questao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Área Temática</label>
                  <input
                    type="text"
                    value={newQ.area}
                    onChange={(e) => setNewQ({ ...newQ, area: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={newQ.prioridade}
                    onChange={(e) => setNewQ({ ...newQ, prioridade: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
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
                  Criar Questão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
