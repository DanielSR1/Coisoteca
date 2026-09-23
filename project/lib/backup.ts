import { supabase, Category, Entry } from './supabase';

export type BackupData = {
  version: number;
  exported_at: string;
  categories: Category[];
  entries: Entry[];
};

export async function exportBackup(): Promise<BackupData> {
  const [catRes, entryRes] = await Promise.all([
    supabase.from('categories').select('*').order('created_at'),
    supabase.from('entries').select('*').order('created_at'),
  ]);

  return {
    version: 1,
    exported_at: new Date().toISOString(),
    categories: (catRes.data || []) as Category[],
    entries: (entryRes.data || []) as Entry[],
  };
}

export function downloadBackupJson(data: BackupData) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `coisoteca-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ImportResult = {
  categories: number;
  entries: number;
};

export async function importBackup(data: BackupData): Promise<ImportResult> {
  if (!data || typeof data !== 'object') {
    throw new Error('Arquivo inválido');
  }
  if (!Array.isArray(data.categories) || !Array.isArray(data.entries)) {
    throw new Error('Estrutura do backup inválida');
  }

  let catCount = 0;
  let entryCount = 0;

  // Insert categories, tracking id mapping in case IDs conflict
  for (const cat of data.categories) {
    const { error } = await supabase.from('categories').upsert(
      {
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
        created_at: cat.created_at,
      },
      { onConflict: 'id' },
    );
    if (error) throw new Error(`Erro ao importar categoria: ${error.message}`);
    catCount++;
  }

  for (const entry of data.entries) {
    const { error } = await supabase.from('entries').upsert(
      {
        id: entry.id,
        category_id: entry.category_id,
        title: entry.title,
        rating: entry.rating,
        comment: entry.comment,
        photo_url: entry.photo_url,
        photo_orientation: entry.photo_orientation || 'horizontal',
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      },
      { onConflict: 'id' },
    );
    if (error) throw new Error(`Erro ao importar avaliação: ${error.message}`);
    entryCount++;
  }

  return { categories: catCount, entries: entryCount };
}

export function parseBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data as BackupData);
      } catch {
        reject(new Error('Não foi possível ler o arquivo de backup'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.readAsText(file);
  });
}
