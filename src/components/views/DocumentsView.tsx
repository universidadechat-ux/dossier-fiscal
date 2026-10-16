import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord } from '../../types';
import {
  FolderArchive,
  Plus,
  Trash2,
  Search,
  FileText,
  FileSpreadsheet,
  Image,
  Upload,
  Download,
  Filter,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const {
    exerciseData,
    addDocument,
    addDocumentWithFile,
    downloadDocumentFile,
    deleteDocument,
    currentYear,
    currentCompany,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFilePayload, setSelectedFilePayload] = useState<{
    name: string;
    type: string;
    size: number;
    base64: string;
  } | null>(null);

  const [newDoc, setNewDoc] = useState<Partial<DocumentRecord>>({
    nome: '',
    categoria: 'Bancos e Financiamentos',
    tipoFicheiro: 'pdf',
    tamanho: '1.2 MB',
    data: new Date().toLocaleDateString('pt-PT'),
    autor: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
    exercicio: currentYear,
    area: 'Bancos',
    contaAssociada: '',
    observacoes: '',
  });

  const categories = [
    'todas',
    'Bancos e Financiamentos',
    'Inventários',
    'Gestão de Ativos',
    'Pessoal e Remunerações',
    'AT / Obrigações Fiscais',
    'Cálculo de IRC',
    'Contratos & Atas',
  ];

  const filteredDocs = exerciseData.documents.filter((doc) => {
    const matchesSearch =
      doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.observacoes.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory !== 'todas' && doc.categoria !== selectedCategory) return false;
    return true;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const sizeStr = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      let extType: DocumentRecord['tipoFicheiro'] = 'pdf';
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) extType = 'excel';
      else if (lower.endsWith('.csv')) extType = 'csv';
      else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) extType = 'imagem';
      else if (lower.endsWith('.docx') || lower.endsWith('.doc')) extType = 'word';

      setSelectedFilePayload({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        base64,
      });

      setNewDoc((prev) => ({
        ...prev,
        nome: file.name,
        tamanho: sizeStr,
        tipoFicheiro: extType,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.nome) {
      showToast('Preencha o nome do documento ou selecione um ficheiro.', 'error');
      return;
    }

    const docRecordData = {
      nome: newDoc.nome,
      categoria: newDoc.categoria || 'Geral',
      tipoFicheiro: (newDoc.tipoFicheiro as any) || 'pdf',
      tamanho: newDoc.tamanho || '1.0 MB',
      data: newDoc.data || new Date().toLocaleDateString('pt-PT'),
      autor: newDoc.autor || 'Contabilista',
      exercicio: currentYear,
      area: newDoc.area || 'Geral',
      contaAssociada: newDoc.contaAssociada || '',
      observacoes: newDoc.observacoes || '',
    };

    if (selectedFilePayload) {
      addDocumentWithFile(docRecordData, selectedFilePayload);
    } else {
      addDocument(docRecordData);
    }

    setIsAddModalOpen(false);
    setSelectedFilePayload(null);
    setNewDoc({
      nome: '',
      categoria: 'Bancos e Financiamentos',
      tipoFicheiro: 'pdf',
      tamanho: '1.2 MB',
      data: new Date().toLocaleDateString('pt-PT'),
      autor: currentCompany.responsavelPrincipal.split(' ')[0] || 'Contabilista',
      exercicio: currentYear,
      area: 'Bancos',
      contaAssociada: '',
      observacoes: '',
    });
  };

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem a certeza de que pretende eliminar o documento "${nome}" do Dossier Fiscal?`)) {
      deleteDocument(id);
    }
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'excel':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'imagem':
        return <Image className="w-4 h-4 text-blue-600" />;
      case 'pdf':
      default:
        return <FileText className="w-4 h-4 text-rose-600" />;
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
            <FolderArchive className="w-5 h-5 text-indigo-600" />
            <span>Repositório de Documentos & Arquivo Digital (Art. 130.º CIRC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralização de comprovativos, extratos, faturas, atas e folhas de cálculo organizados por área e exercício fiscal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Carregar / Anexar Documento</span>
        </button>
      </div>

      {/* Aviso de Armazenamento Local no Dispositivo (Requisito Obrigatório) */}
      <div className="flex items-center justify-between gap-3 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-950">
        <div className="flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Armazenamento Local:</strong> Os dados desta aplicação são armazenados localmente neste dispositivo.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          IndexedDB Ativo · 100% Seguro & Privado
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'todas' ? `Todos (${exerciseData.documents.length})` : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar documento, autor..."
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-56"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Ficheiro / Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Área de Trabalho</th>
                <th className="px-4 py-3">Conta Associada</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3 text-right">Tamanho</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(doc.tipoFicheiro)}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => doc.fileStoredInIndexedDB && downloadDocumentFile(doc.id, doc.nome)}
                            className={`font-semibold ${
                              doc.fileStoredInIndexedDB
                                ? 'text-indigo-600 hover:underline cursor-pointer'
                                : 'text-slate-800'
                            }`}
                            title={doc.fileStoredInIndexedDB ? 'Clique para descarregar ficheiro do IndexedDB' : ''}
                          >
                            {doc.nome}
                          </span>
                          {doc.fileStoredInIndexedDB && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              IndexedDB
                            </span>
                          )}
                        </div>
                        {doc.observacoes && (
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            {doc.observacoes}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{doc.categoria}</td>
                  <td className="px-4 py-3 text-slate-600">{doc.area}</td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-700">
                    {doc.contaAssociada || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">{doc.data}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{doc.autor}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400 whitespace-nowrap">
                    {doc.tamanho}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                    {doc.fileStoredInIndexedDB && (
                      <button
                        onClick={() => downloadDocumentFile(doc.id, doc.nome)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                        title="Descarregar ficheiro guardado localmente"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id, doc.nome)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adição de Documento */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Carregar / Registar Documento no Dossier Fiscal
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              {/* Seletor de ficheiro real para armazenamento no IndexedDB */}
              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center hover:bg-slate-100/70 transition-colors">
                <label className="block cursor-pointer">
                  <Upload className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-800 block">
                    {selectedFilePayload ? `Ficheiro: ${selectedFilePayload.name}` : 'Selecionar ficheiro do computador (IndexedDB)'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {selectedFilePayload
                      ? `Tamanho: ${newDoc.tamanho} · Formato: ${newDoc.tipoFicheiro?.toUpperCase()} · Pronto para gravar`
                      : 'PDF, Excel, Imagem ou Word (guardado localmente no dispositivo)'}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg"
                  />
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Documento *</label>
                <input
                  type="text"
                  placeholder="Ex: Extrato_Bancario_Millennium_31dez2026.pdf"
                  value={newDoc.nome}
                  onChange={(e) => setNewDoc({ ...newDoc, nome: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newDoc.categoria}
                    onChange={(e) => setNewDoc({ ...newDoc, categoria: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Bancos e Financiamentos">Bancos e Financiamentos</option>
                    <option value="Inventários">Inventários</option>
                    <option value="Gestão de Ativos">Gestão de Ativos</option>
                    <option value="Pessoal e Remunerações">Pessoal e Remunerações</option>
                    <option value="AT / Obrigações Fiscais">AT / Obrigações Fiscais</option>
                    <option value="Cálculo de IRC">Cálculo de IRC</option>
                    <option value="Contratos & Atas">Contratos & Atas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Formato</label>
                  <select
                    value={newDoc.tipoFicheiro}
                    onChange={(e) => setNewDoc({ ...newDoc, tipoFicheiro: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none uppercase"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel (XLSX)</option>
                    <option value="word">Word (DOCX)</option>
                    <option value="csv">CSV</option>
                    <option value="imagem">Imagem (JPG/PNG)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Área de Trabalho</label>
                  <input
                    type="text"
                    value={newDoc.area}
                    onChange={(e) => setNewDoc({ ...newDoc, area: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Conta Associada (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 12.1.2"
                    value={newDoc.contaAssociada}
                    onChange={(e) => setNewDoc({ ...newDoc, contaAssociada: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={newDoc.observacoes}
                  onChange={(e) => setNewDoc({ ...newDoc, observacoes: e.target.value })}
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
                  Anexar Ficheiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
