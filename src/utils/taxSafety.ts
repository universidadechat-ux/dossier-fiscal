/**
 * Regras de Segurança Fiscal e Validação Legal para o Encerramento Português
 */

export const TAX_CONFIRMATION_NOTICE =
  'Esta informação necessita de confirmação com base na legislação aplicável ao exercício fiscal em análise.';

export const UNCONFIRMED_TAX_RATE = 'Taxa fiscal por confirmar.';
export const UNCONFIRMED_DEADLINE = 'PRAZO LEGAL POR CONFIRMAR';

export interface LegalReference {
  diploma: string; // Ex: "Código do IRC"
  artigo: string;  // Ex: "Artigo 88.º"
  numero?: string; // Ex: "n.º 3"
  alinea?: string; // Ex: "alínea a)"
  fonte: string;   // Ex: "Diário da República / AT"
  dataValidacao: string; // Ex: "15/01/2026"
  validado: boolean;
}

export function formatLegalReference(ref: LegalReference): string {
  const parts = [ref.diploma, ref.artigo];
  if (ref.numero) parts.push(ref.numero);
  if (ref.alinea) parts.push(ref.alinea);
  return parts.join(', ');
}

// Taxas de Tributação Autónoma de referência (art. 88.º CIRC) parametrizáveis
export const DEFAULT_AUTONOMOUS_TAX_RATES = {
  // Viaturas ligeiras de passageiros (custo de aquisição)
  viaturas_escalao1: { taxa: 0.085, label: 'Viaturas elétricas (> 62.500 €) / Outras (< 27.500 €)' },
  viaturas_escalao2: { taxa: 0.255, label: 'Viaturas de 27.500 € a 35.000 €' },
  viaturas_escalao3: { taxa: 0.325, label: 'Viaturas superiores a 35.000 €' },
  despesas_representacao: { taxa: 0.10, label: 'Despesas de representação' },
  ajudas_custo_nao_faturadas: { taxa: 0.05, label: 'Ajudas de custo e kms não faturados a clientes' },
  despesas_nao_documentadas: { taxa: 0.50, label: 'Despesas não documentadas' },
  remuneracoes_bonus: { taxa: 0.35, label: 'Bónus e remunerações variáveis a administradores/gerentes' },
};
