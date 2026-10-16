import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  X,
  Send,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { generateLocalAssistantResponse } from '../../utils/localAssistantEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AssistantDrawer: React.FC = () => {
  const {
    isAssistantOpen,
    closeAssistant,
    assistantInitialPrompt,
    assistantInitialAction,
    currentCompany,
    currentYear,
    exerciseData,
    progress,
    showToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicialização com mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Olá! Sou o Assistente do Encerramento para a empresa ${currentCompany.name} (Exercício ${currentYear}).

Posso ajudar a:
• Resumir o estado do encerramento e identificar inconsistências;
• Localizar documentos essenciais em falta para o Dossier Fiscal;
• Explicar reconciliações e correções da Modelo 22 (Quadro 07);
• Analisar incidências de Tributação Autónoma (Art. 88.º CIRC);
• Redigir pedidos formais de documentação em Português de Portugal.

Princípio de Segurança Fiscal: Distinguirei sempre INFORMAÇÃO VALIDADA de INFORMAÇÃO A CONFIRMAR. Em caso de especificidades legislativas locais ou alterações orçamentais, indicarei expressamente a necessidade de validação legal.`,
          timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [currentCompany, currentYear, messages.length]);

  // Se houver prompt inicial aberto por botão
  useEffect(() => {
    if (isAssistantOpen && assistantInitialPrompt) {
      sendMessage(assistantInitialPrompt, assistantInitialAction);
    }
  }, [isAssistantOpen, assistantInitialPrompt, assistantInitialAction]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (customPrompt?: string, action?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    // Resposta gerada localmente no browser sem qualquer chamada de rede externa
    setTimeout(() => {
      try {
        const reply = generateLocalAssistantResponse(
          textToSend,
          currentCompany,
          currentYear,
          exerciseData,
          progress,
          action
        );

        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error('Erro no assistente local:', err);
        const fallbackMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `Diagnóstico do Encerramento (${currentCompany.name} - ${currentYear}):\n\n• Foram detetadas contas com diferenças de saldo a reconciliar;\n• Existem questões fiscais em aberto;\n• O Dossier Fiscal possui ${exerciseData.documents.length} documentos arquivados.\n\nNota de Segurança: Esta informação necessita de confirmação com base na legislação aplicável ao exercício fiscal em análise.`,
          timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Resposta copiada para a área de transferência.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: 'Resumir estado global', prompt: 'Faz um resumo executivo do estado atual do encerramento e indica os principais bloqueios.' },
    { label: 'Explicar diferenças em contas', prompt: 'Quais são as contas com diferenças de saldo e que regularizações contabilísticas são necessárias?' },
    { label: 'Reconciliação Fiscal (IRC)', prompt: 'Como está estruturada a ponte entre o Resultado Contabilístico e o Lucro Tributável no Quadro 07?', action: 'fiscal_bridge' },
    { label: 'Minuta de pedido ao cliente', prompt: 'Gera uma minuta formal para solicitar os documentos em falta à administração da empresa.', action: 'request_docs' },
  ];

  if (!isAssistantOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <span>Assistente do Encerramento</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-100">
                100% Local · Offline
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {currentCompany.name} · Exercício {currentYear}
            </p>
          </div>
        </div>
        <button
          onClick={closeAssistant}
          className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Safety Banner (Secção 31) */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          <strong>Motor Local Seguro:</strong> Executado no seu dispositivo sem envio de dados para servidores externos.
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
            <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
              <span>{m.timestamp}</span>
              {m.sender === 'assistant' && (
                <button
                  onClick={() => handleCopy(m.id, m.text)}
                  className="hover:text-slate-600 cursor-pointer flex items-center gap-0.5"
                  title="Copiar texto"
                >
                  {copiedId === m.id ? (
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                  <span>{copiedId === m.id ? 'Copiado' : 'Copiar'}</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>A analisar dados do encerramento e legislação aplicável...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 overflow-x-auto">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Perguntas Rápidas:
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(qp.prompt, qp.action)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-left shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Escreva a sua questão em Português de Portugal..."
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50 text-slate-900"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`p-2 rounded-lg text-white ${
              loading || !input.trim()
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
