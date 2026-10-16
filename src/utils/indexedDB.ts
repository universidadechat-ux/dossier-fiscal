/**
 * Gestor de Persistência Local com IndexedDB para Encerramento e Dossier Fiscal PT
 * 
 * Cumpre os requisitos:
 * - Armazenamento 100% no dispositivo (IndexedDB)
 * - Suporte a grandes volumes e ficheiros/documentos anexados (Blobs / Base64)
 * - Sistema de Cópia de Segurança (Exportar Backup / Importar Backup)
 * - Funcionamento autónomo sem dependência de servidores externos ou custos
 */

import { Company, ExerciseData, DocumentRecord } from '../types';
import { INITIAL_COMPANIES, EXERCISE_2026_LUSITANIA, EXERCISE_2025_LUSITANIA } from '../data/mockDatabase';

const DB_NAME = 'EncerramentoFiscalPT_DB';
const DB_VERSION = 1;

export interface StoredDocumentFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataBase64: string;
  uploadedAt: string;
  exercicio: string;
  companyId: string;
}

export interface AppBackupData {
  version: string;
  exportDate: string;
  appTitle: string;
  notice: string;
  companies: Company[];
  exerciseStore: { [key: string]: ExerciseData };
  files: StoredDocumentFile[];
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function openLocalDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado neste ambiente.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Armazém para Empresas
      if (!db.objectStoreNames.contains('companies')) {
        db.createObjectStore('companies', { keyPath: 'id' });
      }

      // Armazém para Exercícios Contabilísticos
      if (!db.objectStoreNames.contains('exercises')) {
        db.createObjectStore('exercises', { keyPath: 'storeKey' });
      }

      // Armazém para Ficheiros Reais de Documentos (PDF, Excel, Imagens)
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }

      // Armazém para Metadados e Definições da Aplicação
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Erro ao abrir IndexedDB:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Carrega a lista de empresas do IndexedDB
 */
export async function loadCompaniesFromIndexedDB(): Promise<Company[] | null> {
  try {
    const db = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['companies'], 'readonly');
      const store = transaction.objectStore('companies');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as Company[];
        if (results && results.length > 0) {
          resolve(results);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Falha ao carregar empresas do IndexedDB:', error);
    return null;
  }
}

/**
 * Guarda a lista de empresas no IndexedDB
 */
export async function saveCompaniesToIndexedDB(companies: Company[]): Promise<void> {
  try {
    const db = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['companies'], 'readwrite');
      const store = transaction.objectStore('companies');

      store.clear();
      companies.forEach((comp) => store.put(comp));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Falha ao guardar empresas no IndexedDB:', error);
  }
}

/**
 * Carrega todos os exercícios do IndexedDB
 */
export async function loadExercisesFromIndexedDB(): Promise<{ [key: string]: ExerciseData } | null> {
  try {
    const db = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exercises'], 'readonly');
      const store = transaction.objectStore('exercises');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as { storeKey: string; data: ExerciseData }[];
        if (results && results.length > 0) {
          const map: { [key: string]: ExerciseData } = {};
          results.forEach((item) => {
            map[item.storeKey] = item.data;
          });
          resolve(map);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Falha ao carregar exercícios do IndexedDB:', error);
    return null;
  }
}

/**
 * Guarda todos os exercícios no IndexedDB
 */
export async function saveExercisesToIndexedDB(exerciseStore: { [key: string]: ExerciseData }): Promise<void> {
  try {
    const db = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exercises'], 'readwrite');
      const store = transaction.objectStore('exercises');

      store.clear();
      Object.entries(exerciseStore).forEach(([storeKey, data]) => {
        store.put({ storeKey, data });
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Falha ao guardar exercícios no IndexedDB:', error);
  }
}

/**
 * Guarda o ficheiro de um documento localmente em IndexedDB
 */
export async function saveDocumentFileToIndexedDB(file: StoredDocumentFile): Promise<void> {
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    const req = store.put(file);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Obtém o ficheiro de um documento a partir do IndexedDB
 */
export async function getDocumentFileFromIndexedDB(id: string): Promise<StoredDocumentFile | null> {
  try {
    const db = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`Ficheiro ${id} não encontrado no IndexedDB:`, err);
    return null;
  }
}

/**
 * Elimina o ficheiro de um documento do IndexedDB
 */
export async function deleteDocumentFileFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`Erro ao apagar ficheiro ${id} do IndexedDB:`, err);
  }
}

/**
 * Obtém todos os ficheiros armazenados
 */
export async function getAllStoredFiles(): Promise<StoredDocumentFile[]> {
  try {
    const db = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erro ao obter ficheiros do IndexedDB:', err);
    return [];
  }
}

/**
 * Exporta uma cópia de segurança completa em formato JSON
 */
export async function exportCompleteBackup(
  companies: Company[],
  exerciseStore: { [key: string]: ExerciseData }
): Promise<Blob> {
  const allFiles = await getAllStoredFiles();

  const backupPayload: AppBackupData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    appTitle: 'Encerramento e Dossier Fiscal PT',
    notice: 'Os dados desta aplicação são armazenados localmente neste dispositivo.',
    companies,
    exerciseStore,
    files: allFiles,
  };

  const jsonString = JSON.stringify(backupPayload, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Importa e valida uma cópia de segurança anterior
 */
export async function importCompleteBackup(fileContent: string): Promise<{
  companies: Company[];
  exerciseStore: { [key: string]: ExerciseData };
  filesCount: number;
}> {
  let parsed: any;
  try {
    parsed = JSON.parse(fileContent);
  } catch (e) {
    throw new Error('Ficheiro de backup inválido: não é um JSON bem formatado.');
  }

  if (!parsed.companies || !Array.isArray(parsed.companies)) {
    throw new Error('Ficheiro de backup inválido: lista de empresas ausente.');
  }

  if (!parsed.exerciseStore || typeof parsed.exerciseStore !== 'object') {
    throw new Error('Ficheiro de backup inválido: dados dos exercícios ausentes.');
  }

  // Guardar no IndexedDB
  await saveCompaniesToIndexedDB(parsed.companies);
  await saveExercisesToIndexedDB(parsed.exerciseStore);

  // Restaurar ficheiros se existirem
  if (Array.isArray(parsed.files)) {
    const db = await openLocalDatabase();
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    parsed.files.forEach((file: StoredDocumentFile) => {
      store.put(file);
    });
  }

  return {
    companies: parsed.companies,
    exerciseStore: parsed.exerciseStore,
    filesCount: Array.isArray(parsed.files) ? parsed.files.length : 0,
  };
}

/**
 * Descarrega o ficheiro Blob com nome formatado
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
