import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client if key is available
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Erro ao inicializar GoogleGenAI:', err);
    }
  }

  // API do Assistente do Encerramento
  app.post('/api/assistant', async (req, res) => {
    const { prompt, companyContext, action } = req.body;

    const systemInstruction = `És o Assistente do Encerramento Contabilístico e Fiscal de empresas portuguesas.
A tua comunicação deve ser estritamente em Português de Portugal (PT-PT).
Terminologia obrigatória: "ficheiro", "utilizador", "fatura", "contabilista", "empresa", "exercício", "encerramento", "apuramento", "conferência", "reconciliação", "imparidade", "depreciação", "tributação autónoma", "IVA", "IRC", "IES", "Modelo 22".
Datas: DD/MM/AAAA. Valores: formato português (ex: 1 250,00 €).
Segurança Fiscal:
1. Nunca inventes legislação, artigos de códigos tributários, taxas fiscais ou prazos legais como se fossem factos garantidos.
2. Distingue sempre INFORMAÇÃO VALIDADA de INFORMAÇÃO A CONFIRMAR.
3. Se existirem dúvidas ou a legislação para o exercício fiscal específico requerer validação, responde expressamente com a frase canónica: "Esta informação necessita de confirmação com base na legislação aplicável ao exercício fiscal em análise."
4. Ajuda o contabilista a organizar o Dossier Fiscal, resumir pendentes, detetar diferenças em contas, redigir pedidos de documentação ao cliente e preparar a ponte entre o Resultado Contabilístico e o Resultado Fiscal.`;

    if (ai && apiKey) {
      try {
        const fullPrompt = `Contexto da Empresa e Exercício:
${JSON.stringify(companyContext || {}, null, 2)}

Ação solicitada: ${action || 'consulta geral'}
Mensagem do Utilizador:
${prompt || 'Por favor, analisa o estado do encerramento e indica os principais pontos de atenção.'}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        return res.json({ text: response.text });
      } catch (error: any) {
        console.error('Falha na chamada Gemini API:', error);
        // Fallback para resposta contextualizada estruturada
      }
    }

    // Resposta contextualizada e inteligente de fallback (100% PT-PT)
    const company = companyContext?.company || { name: 'Empresa', year: '2026' };
    const diffsCount = companyContext?.accountsWithDiffCount || 0;
    const missingDocsCount = companyContext?.missingDocsCount || 0;
    const pendingQuestionsCount = companyContext?.pendingQuestionsCount || 0;

    let responseText = '';
    if (action === 'request_docs') {
      responseText = `Exmos. Senhores,\n\nNo âmbito dos trabalhos preparatórios do Encerramento Contabilístico e Fiscal do exercício de ${company.year} da empresa ${company.name}, solicitamos o envio dos seguintes elementos em falta:\n\n` +
        (companyContext?.missingDocsList?.length
          ? companyContext.missingDocsList.map((d: string) => `• ${d}`).join('\n')
          : '• Extratos bancários com termo a 31 de dezembro;\n• Listagem e mapas de contagem física de inventários finais;\n• Faturas em falta de compras e serviços externos do 4.º trimestre;\n• Comprovativos e extratos de empréstimos bancários e contratos de locação financeira;\n• Certidão de não dívida da Autoridade Tributária e da Segurança Social.') +
        `\n\nAgradecemos a disponibilização da documentação solicitada com a maior brevidade possível, de modo a assegurar o cumprimento tempestivo dos prazos legais de aprovação de contas e submissão declarativa.\n\nCom os melhores cumprimentos,\nO Departamento de Contabilidade`;
    } else if (action === 'fiscal_bridge') {
      responseText = `Resumo da Ponte Contabilística para Fiscal (${company.year}):\n\n` +
        `1. INFORMAÇÃO VALIDADA:\n` +
        `• O apuramento parte do Resultado Contabilístico antes de Impostos (RAI).\n` +
        `• Devem ser acrescidas as Tributações Autónomas (art. 88.º do CIRC), despesas não documentadas e encargos com viaturas na respetiva proporção legal.\n` +
        `• Amortizações acima das taxas do Decreto Regulamentar n.º 25/2009 requerem acréscimo no Quadro 07 da Modelo 22.\n\n` +
        `2. INFORMAÇÃO A CONFIRMAR:\n` +
        `• Existência e validade de benefícios fiscais (RFAI, SIFIDE, ICE) e limites de dedução de prejuízos fiscais reportáveis.\n` +
        `• Esta informação necessita de confirmação com base na legislação aplicável ao exercício fiscal em análise.`;
    } else {
      responseText = `Diagnóstico do Encerramento — ${company.name} (${company.year}):\n\n` +
        `• Contas com diferenças por regularizar: ${diffsCount} contas.\n` +
        `• Documentos prioritários em falta: ${missingDocsCount} itens.\n` +
        `• Questões pendentes de análise: ${pendingQuestionsCount} assuntos.\n\n` +
        `Recomendações prioritárias:\n` +
        `1. Efetuar a reconciliação e justificação das contas bancárias e contas correntes de terceiros (Clientes e Fornecedores);\n` +
        `2. Validar a contagem física dos inventários finais e analisar eventuais perdas por imparidade;\n` +
        `3. Verificar o mapa de Tributações Autónomas e respetivos limites de dedutibilidade fiscal;\n` +
        `4. Confirmar a totalidade dos comprovativos para arquivo no Dossier Fiscal definitivo.`;
    }

    return res.json({ text: responseText });
  });

  // Em desenvolvimento, montar o Vite como middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor Encerramento PT ativo em http://localhost:${port}`);
  });
}

startServer();
