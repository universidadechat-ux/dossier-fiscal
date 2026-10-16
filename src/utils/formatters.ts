/**
 * Formatadores e utilitários de apresentação em Português de Portugal (PT-PT)
 */

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00 €';
  }
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const parts = absValue.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const decimalPart = parts[1];
  const formatted = `${integerPart},${decimalPart} €`;
  return isNegative ? `-${formatted}` : formatted;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  // If already in DD/MM/AAAA format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatNIF(nif: string): string {
  if (!nif) return '';
  const clean = nif.replace(/\D/g, '');
  if (clean.length === 9) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return nif;
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'concluido':
      return {
        label: 'Concluído',
        dotClass: 'bg-emerald-600',
        textClass: 'text-emerald-700 font-medium',
        bgClass: 'bg-emerald-50 border-emerald-200',
        icon: '🟢',
      };
    case 'em_curso':
      return {
        label: 'Em curso',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-700 font-medium',
        bgClass: 'bg-amber-50 border-amber-200',
        icon: '🟡',
      };
    case 'revisao':
      return {
        label: 'Necessita de revisão',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-700 font-medium',
        bgClass: 'bg-orange-50 border-orange-200',
        icon: '🟠',
      };
    case 'em_falta':
      return {
        label: 'Em falta',
        dotClass: 'bg-rose-600',
        textClass: 'text-rose-700 font-medium',
        bgClass: 'bg-rose-50 border-rose-200',
        icon: '🔴',
      };
    case 'nao_aplicavel':
      return {
        label: 'Não aplicável',
        dotClass: 'bg-blue-600',
        textClass: 'text-blue-700 font-medium',
        bgClass: 'bg-blue-50 border-blue-200',
        icon: '🔵',
      };
    case 'nao_iniciado':
    default:
      return {
        label: 'Não iniciado',
        dotClass: 'bg-slate-400',
        textClass: 'text-slate-600 font-medium',
        bgClass: 'bg-slate-50 border-slate-200',
        icon: '⚪',
      };
  }
}
