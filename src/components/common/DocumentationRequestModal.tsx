import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, X, Copy, Check, FileText } from 'lucide-react';

export const DocumentationRequestModal: React.FC = () => {
  const {
    isDocRequestModalOpen,
    closeDocRequestModal,
    currentCompany,
    currentYear,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({
    'extratos_bancarios': true,
    'inventario_final': true,
    'contratos_leasing': true,
    'faturas_dezembro': true,
    'confirmacoes_saldo': true,
    'comprovativo_subsidio': true,
    'certidoes_nao_divida': false,
    'atas_gerencia': true,
  });

  const availableDocs = [
    { id: 'extratos_bancarios', label: 'Extratos bancários de todas as contas abertas com data de termo a 31 de dezembro' },
    { id: 'inventario_final', label: 'Listagem final de inventários e mapa de contagem física assinado pelo responsável' },
    { id: 'contratos_leasing', label: 'Contratos de locação financeira (leasing), ALD e planos de amortização de empréstimos bancários' },
    { id: 'faturas_dezembro', label: 'Faturas em falta de compras e serviços externos respeitantes aos meses de novembro e dezembro' },
    { id: 'confirmacoes_saldo', label: 'Extratos de conta corrente e respostas aos pedidos de confirmação de saldos de fornecedores/clientes' },
    { id: 'comprovativo_subsidio', label: 'Documentos de suporte de subsídios aprovados e respetivos comprovativos bancários de recebimento' },
    { id: 'certidoes_nao_divida', label: 'Certidão de não dívida à Autoridade Tributária e Segurança Social válidas a 31/12' },
    { id: 'atas_gerencia', label: 'Cópia das atas de gerência/administração do exercício com deliberações de remunerações e investimentos' },
  ];

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateEmailText = () => {
    const checkedLabels = availableDocs
      .filter((d) => selectedItems[d.id])
      .map((d) => `  • ${d.label};`);

    return `Exmos. Senhores,
Administração / Direção Financeira de ${currentCompany.name}

Assunto: Encerramento Contabilístico e Fiscal do Exercício de ${currentYear} — Solicitação de Documentação em Falta

No âmbito dos trabalhos preparatórios do Encerramento de Contas e organização do respetivo Dossier Fiscal do exercício de ${currentYear}, vimos por este meio solicitar o envio com a brevidade possível dos seguintes elementos em falta:

${checkedLabels.join('\n')}

A correta e atempada receção destes documentos é imprescindível para assegurar:
1. A conferência rigorosa das contas e saldos bancários;
2. A validação das deduções fiscais e apuramento tempestivo da estimativa de IRC;
3. O cumprimento escrupuloso dos prazos legais de aprovação de contas e submissão da Modelo 22 e IES perante a Autoridade Tributária.

Agradecemos desde já a vossa habitual colaboração e mantemo-nos ao dispor para qualquer esclarecimento complementar.

Com os melhores cumprimentos,

${currentCompany.responsavelPrincipal}
Departamento de Contabilidade e Fiscalidade`;
  };

  const handleCopy = () => {
    const text = generateEmailText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Minuta de email copiada para a área de transferência.');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isDocRequestModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pedidos de Documentação — Minuta de Email
              </h2>
              <p className="text-xs text-slate-500">
                Gerador de comunicação formal em Português de Portugal para envio à empresa
              </p>
            </div>
          </div>
          <button
            onClick={closeDocRequestModal}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seleção de Documentos a Solicitar */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Selecione a documentação em falta:
            </h3>
            <div className="space-y-1.5 border border-slate-200 rounded-lg p-3 bg-slate-50">
              {availableDocs.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer p-1 rounded hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={!!selectedItems[doc.id]}
                    onChange={() => toggleItem(doc.id)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <span>{doc.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Visualização da Minuta Gerada */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Texto pronto para envio por email (PT-PT)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={11}
              value={generateEmailText()}
              className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-lg text-slate-800 leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Texto redigido em conformidade com as boas práticas do SNC e OCC.
          </span>
          <button
            onClick={closeDocRequestModal}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
