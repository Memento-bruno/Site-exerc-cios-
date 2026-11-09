import { db, TABLE_NAMES } from './schema';

export const BACKUP_VERSION = 1;

interface BackupPhoto {
  id?: number;
  date: string;
  week: number;
  label?: string;
  createdAt: string;
  /** Imagem em data URL (base64). */
  dataUrl: string;
}

export interface Backup {
  app: 'rumo-aos-5km';
  version: number;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(blob);
  });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blobToArrayBuffer(blob));
  let bin = '';
  for (let i = 0; i < buf.length; i += 0x8000) {
    bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  }
  return `data:${blob.type || 'image/jpeg'};base64,${btoa(bin)}`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(',');
  const type = head.match(/data:(.*?);/)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

export async function exportBackup(): Promise<Backup> {
  const tables: Record<string, unknown[]> = {};
  for (const name of TABLE_NAMES) {
    if (name === 'photos') {
      const photos = await db.photos.toArray();
      tables.photos = await Promise.all(
        photos.map(async (p): Promise<BackupPhoto> => {
          const { blob, ...rest } = p;
          return { ...rest, dataUrl: await blobToDataUrl(blob) };
        }),
      );
    } else {
      tables[name] = await db.table(name).toArray();
    }
  }
  return {
    app: 'rumo-aos-5km',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tables,
  };
}

export function validateBackup(data: unknown): data is Backup {
  if (!data || typeof data !== 'object') return false;
  const b = data as Partial<Backup>;
  return (
    b.app === 'rumo-aos-5km' &&
    typeof b.version === 'number' &&
    !!b.tables &&
    typeof b.tables === 'object'
  );
}

/** Substitui todos os dados pelos do backup. */
export async function importBackup(data: unknown): Promise<void> {
  if (!validateBackup(data)) throw new Error('Arquivo de backup inválido.');
  await db.transaction(
    'rw',
    TABLE_NAMES.map((n) => db.table(n)),
    async () => {
      for (const name of TABLE_NAMES) {
        const table = db.table(name);
        await table.clear();
        const rows = data.tables[name] ?? [];
        if (name === 'photos') {
          const photos = (rows as BackupPhoto[]).map(({ dataUrl, ...rest }) => ({
            ...rest,
            blob: dataUrlToBlob(dataUrl),
          }));
          if (photos.length) await db.photos.bulkAdd(photos);
        } else if (rows.length) {
          await table.bulkAdd(rows);
        }
      }
    },
  );
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    TABLE_NAMES.map((n) => db.table(n)),
    async () => {
      for (const name of TABLE_NAMES) await db.table(name).clear();
    },
  );
}

export function backupFileName(date = new Date()): string {
  return `rumo-aos-5km-backup-${date.toISOString().slice(0, 10)}.json`;
}
