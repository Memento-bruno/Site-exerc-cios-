import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import { usePhotos, useSettingsOrDefault, todayIso } from '@/db/hooks';
import { db, type Photo } from '@/db/schema';
import { fromISODate, planPosition } from '@/lib/dates';

function useObjectUrl(blob: Blob | undefined) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}

function PhotoImg({ photo, className }: { photo: Photo; className?: string }) {
  const url = useObjectUrl(photo.blob);
  return url ? (
    <img src={url} alt={`Foto da semana ${photo.week}`} className={className} />
  ) : (
    <div className={className} />
  );
}

async function compress(file: File, maxW = 1200): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxW / bmp.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/jpeg', 0.82),
    );
  } catch {
    return file;
  }
}

export function PhotosSection() {
  const photos = usePhotos();
  const settings = useSettingsOrDefault();
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const list = useMemo(() => photos ?? [], [photos]);
  const pa = useMemo(() => list.find((p) => p.id === a) ?? list[0], [list, a]);
  const pb = useMemo(() => list.find((p) => p.id === b) ?? list.at(-1), [list, b]);

  async function add(file: File | undefined) {
    if (!file) return;
    const blob = await compress(file);
    const date = todayIso();
    const week = planPosition(
      fromISODate(settings.startDate),
      new Date(),
      settings.weekRepeats,
    ).week;
    await db.photos.add({ date, week, blob, createdAt: new Date().toISOString() });
  }

  return (
    <section className="card p-4" aria-label="Fotos de progresso">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">Fotos de progresso</h2>
          <p className="text-xs text-slate-500">
            Ficam só neste aparelho; nunca são enviadas a lugar nenhum. Sugestão: semanas 0, 12 e
            24.
          </p>
        </div>
        <label className="btn-secondary min-h-10 cursor-pointer px-3 text-sm">
          <Icon name="camera" className="size-4" /> Adicionar
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => void add(e.target.files?.[0])}
          />
        </label>
      </div>
      {list.length === 0 ? (
        <p className="mt-3 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800/60">
          Nenhuma foto ainda. Tire a de referência de frente e de lado, com a mesma luz.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[pa, pb].map((p, i) =>
              p ? (
                <figure key={i}>
                  <PhotoImg photo={p} className="aspect-[3/4] w-full rounded-xl object-cover" />
                  <figcaption className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <select
                      className="input min-h-8 w-auto px-1 py-0 text-xs"
                      value={p.id}
                      onChange={(e) =>
                        i === 0 ? setA(Number(e.target.value)) : setB(Number(e.target.value))
                      }
                      aria-label={i === 0 ? 'Foto da esquerda' : 'Foto da direita'}
                    >
                      {list.map((x) => (
                        <option key={x.id} value={x.id}>
                          Sem. {x.week} · {x.date.slice(5).split('-').reverse().join('/')}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-ghost min-h-8 px-2"
                      aria-label="Apagar foto"
                      onClick={() => confirm('Apagar esta foto?') && void db.photos.delete(p.id!)}
                    >
                      <Icon name="trash" className="size-4" />
                    </button>
                  </figcaption>
                </figure>
              ) : null,
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {list.length} foto(s). Escolha duas para comparar lado a lado.
          </p>
        </>
      )}
    </section>
  );
}
