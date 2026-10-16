import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, formatPercent, formatDate, formatNIF, getStatusBadge } from './formatters.ts';
import { formatLegalReference } from './taxSafety.ts';

test('formatCurrency formats values to Portuguese Euro standard', () => {
  assert.equal(formatCurrency(1250), '1 250,00 €');
  assert.equal(formatCurrency(0), '0,00 €');
  assert.equal(formatCurrency(1000000.5), '1 000 000,50 €');
  assert.equal(formatCurrency(-500.25), '-500,25 €');
  assert.equal(formatCurrency(null), '0,00 €');
  assert.equal(formatCurrency(undefined), '0,00 €');
});

test('formatPercent formats percentage values with comma decimal', () => {
  assert.equal(formatPercent(21), '21,0%');
  assert.equal(formatPercent(17.5, 1), '17,5%');
  assert.equal(formatPercent(82.45, 2), '82,45%');
  assert.equal(formatPercent(null), '0%');
});

test('formatDate converts ISO or Date strings to DD/MM/AAAA', () => {
  assert.equal(formatDate('31/12/2026'), '31/12/2026');
  assert.equal(formatDate('2026-12-31'), '31/12/2026');
  assert.equal(formatDate(null), '—');
});

test('formatNIF spaces Portuguese NIF correctly in 3-3-3 pattern', () => {
  assert.equal(formatNIF('508123456'), '508 123 456');
  assert.equal(formatNIF(''), '');
  assert.equal(formatNIF('123'), '123');
});

test('getStatusBadge maps status keys to proper PT-PT labels and color classes', () => {
  assert.equal(getStatusBadge('concluido').label, 'Concluído');
  assert.equal(getStatusBadge('em_curso').label, 'Em curso');
  assert.equal(getStatusBadge('revisao').label, 'Necessita de revisão');
  assert.equal(getStatusBadge('em_falta').label, 'Em falta');
  assert.equal(getStatusBadge('nao_aplicavel').label, 'Não aplicável');
  assert.equal(getStatusBadge('nao_iniciado').label, 'Não iniciado');
});

test('formatLegalReference builds citation string from diploma and article', () => {
  const ref = {
    diploma: 'Código do IRC',
    artigo: 'Artigo 88.º',
    numero: 'n.º 3',
    alinea: 'alínea a)',
    fonte: 'AT',
    dataValidacao: '2026-01-01',
    validado: true
  };
  assert.equal(formatLegalReference(ref), 'Código do IRC, Artigo 88.º, n.º 3, alínea a)');
});
