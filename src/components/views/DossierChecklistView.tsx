import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusBadge } from '../../utils/formatters';
import { ChecklistTask, ItemStatus, Priority } from '../../types';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Calendar,
  UserCheck,
  FileText,
  Filter,
} from 'lucide-react';

export const DossierChecklistView: React.FC = () => {
  const {
    exerciseData,
    updateTask,
    addTask,
    deleteTask,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [activeArea, setActiveArea] = useState<string>('todas');
  const [editingTask, setEditingTask] = useState<ChecklistTask | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const areas = ['todas', 'Bancos', 'Inventários', 'Ativos', 'Tributações Autónomas', 'Cálculo IRC', 'Clientes e Fornecedores', 'Demonstrações Financeiras', 'Dossier Fiscal'];

  const filteredTasks = exerciseData.tasks.filter((t) => {
    if (activeArea === 'todas') return true;
    return t.area === activeArea;
  });

  const [newTask, setNewTask] = useState<Partial<ChecklistTask>>({
    descricao: '',
    area: 'Dossier Fiscal',
    prioridade: 'alta',
    estado: 'nao_iniciado',
    responsavel: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    preparadoPor: '',
    revistoPor: '',
    dataLimite: `31/01/${currentYear}`,
    documento: '',
    observacoes: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.descricao) {
      showToast('Preencha a descrição da tarefa.', 'error');
      return;
    }

    addTask({
      descricao: newTask.descricao,
      area: newTask.area || 'Dossier Fiscal',
      prioridade: (newTask.prioridade as Priority) || 'alta',
      estado: (newTask.estado as ItemStatus) || 'nao_iniciado',
      responsavel: newTask.responsavel || 'Contabilista',
      preparadoPor: newTask.preparadoPor || '',
      revistoPor: newTask.revistoPor || '',
      dataLimite: newTask.dataLimite || `31/01/${currentYear}`,
      documento: newTask.documento || '',
      observacoes: newTask.observacoes || '',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask.id, editingTask);
    setEditingTask(null);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar a tarefa "${desc}"?`)) {
      deleteTask(id);
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
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>Checklist Geral do Dossier Fiscal (Art. 130.º CIRC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhamento de tarefas, evidências de revisão dupla (Preparado por / Revisto por) e datas limite de conclusão.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Tabs de Filtro de Área */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-2 text-xs">
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => setActiveArea(area)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeArea === area
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {area === 'todas' ? `Todas as Áreas (${exerciseData.tasks.length})` : area}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Tarefa / Descrição</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3 text-center">Prioridade</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Prazo Limite</th>
                <th className="px-4 py-3">Revisto Por</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => {
                const badge = getStatusBadge(t.estado);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{t.descricao}</div>
                      {t.documento && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3" />
                          <span>{t.documento}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.area}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          t.prioridade === 'alta'
                            ? 'bg-rose-100 text-rose-800'
                            : t.prioridade === 'media'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.prioridade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badge.bgClass} ${badge.textClass}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{t.responsavel}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{t.dataLimite}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {t.revistoPor ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.revistoPor}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pendente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingTask(t)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.descricao)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edição */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Editar Tarefa da Checklist</h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={editingTask.descricao}
                  onChange={(e) => setEditingTask({ ...editingTask, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={editingTask.estado}
                    onChange={(e) => setEditingTask({ ...editingTask, estado: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="concluido">🟢 Concluído</option>
                    <option value="em_curso">🟡 Em curso</option>
                    <option value="revisao">🟠 Necessita revisão</option>
                    <option value="nao_iniciado">⚪ Não iniciado</option>
                    <option value="nao_aplicavel">🔵 Não aplicável</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={editingTask.prioridade}
                    onChange={(e) => setEditingTask({ ...editingTask, prioridade: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preparado Por</label>
                  <input
                    type="text"
                    value={editingTask.preparadoPor}
                    onChange={(e) => setEditingTask({ ...editingTask, preparadoPor: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Revisto Por</label>
                  <input
                    type="text"
                    value={editingTask.revistoPor}
                    onChange={(e) => setEditingTask({ ...editingTask, revistoPor: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Guardar
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
              <h3 className="text-sm font-bold text-slate-900">Nova Tarefa para a Checklist</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição da Tarefa *</label>
                <input
                  type="text"
                  placeholder="Ex: Conferir mapa de amortizações com Modelo 32"
                  value={newTask.descricao}
                  onChange={(e) => setNewTask({ ...newTask, descricao: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Área</label>
                  <select
                    value={newTask.area}
                    onChange={(e) => setNewTask({ ...newTask, area: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Bancos">Bancos</option>
                    <option value="Inventários">Inventários</option>
                    <option value="Ativos">Ativos</option>
                    <option value="Tributações Autónomas">Tributações Autónomas</option>
                    <option value="Cálculo IRC">Cálculo IRC</option>
                    <option value="Clientes e Fornecedores">Clientes e Fornecedores</option>
                    <option value="Demonstrações Financeiras">Demonstrações Financeiras</option>
                    <option value="Dossier Fiscal">Dossier Fiscal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={newTask.prioridade}
                    onChange={(e) => setNewTask({ ...newTask, prioridade: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsável</label>
                  <input
                    type="text"
                    value={newTask.responsavel}
                    onChange={(e) => setNewTask({ ...newTask, responsavel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prazo Limite</label>
                  <input
                    type="text"
                    value={newTask.dataLimite}
                    onChange={(e) => setNewTask({ ...newTask, dataLimite: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
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
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
