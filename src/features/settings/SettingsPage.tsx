import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import type { Weekday } from '@/data/types';
import { backupFileName, clearAllData, exportBackup, importBackup } from '@/db/backup';
import { useSettings } from '@/db/hooks';
import type { Settings, ThemePreference } from '@/db/schema';
import { updateSettings } from '@/db/settings';
import { WEEKDAY_SHORT, fromISODate, mondayOf, toISODate } from '@/lib/dates';
import {
  notificationsSupported,
  requestNotificationPermission,
  wakeLockSupported,
} from '@/lib/device';
import { useInstallPrompt } from '@/lib/install';
import { speak, speechSupported } from '@/lib/speech';
import { applyTheme } from '@/lib/theme';

const ALL_DAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export function SettingsPage() {
  const settings = useSettings();
  if (!settings) return <div className="p-4 text-slate-500">Carregando…</div>;
  return <SettingsForm s={settings} />;
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div>
        <p className="font-medium">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span
        className={`absolute top-1 size-6 rounded-full bg-white shadow transition ${on ? 'left-7' : 'left-1'}`}
      />
    </button>
  );
}

function SettingsForm({ s }: { s: Settings }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const install = useInstallPrompt();
  const up = (patch: Partial<Settings>) => void updateSettings(patch);

  async function doExport() {
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setMsg('Backup exportado. Guarde o arquivo num lugar seguro (Drive, e-mail).');
  }

  async function doImport(file: File | undefined) {
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      await importBackup(json);
      setMsg('Backup importado. Tudo restaurado.');
    } catch (e) {
      setMsg(`Não foi possível importar: ${(e as Error).message}`);
    }
  }

  async function doClear() {
    await clearAllData();
    setConfirmClear(false);
    location.href = '/';
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Configurações</h1>
      {msg && (
        <p
          role="status"
          className="rounded-xl bg-brand-50 p-3 text-sm text-brand-900 dark:bg-brand-900/20 dark:text-brand-100"
        >
          {msg}
        </p>
      )}

      {!install.installed && (install.canPrompt || install.ios) && (
        <section className="card border-l-4 border-l-brand-500 p-4">
          <h2 className="font-bold">Instalar como app</h2>
          {install.canPrompt ? (
            <>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Abre direto, em tela cheia, e funciona offline.
              </p>
              <button className="btn-primary mt-3 w-full" onClick={() => void install.prompt()}>
                <Icon name="download" className="size-5" /> Instalar app
              </button>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              No iPhone: toque em <strong>Compartilhar</strong> (quadrado com seta) e depois em{' '}
              <strong>Adicionar à Tela de Início</strong>.
            </p>
          )}
        </section>
      )}

      <section className="card divide-y divide-slate-100 px-4 dark:divide-slate-800">
        <Row label="Tema">
          <select
            className="input min-h-10 w-auto px-2 py-0 text-sm"
            value={s.theme}
            onChange={(e) => {
              const t = e.target.value as ThemePreference;
              applyTheme(t);
              up({ theme: t });
            }}
            aria-label="Tema"
          >
            <option value="system">Automático</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </Row>
        <Row label="Unidades" hint="kg, km e min/km (sistema métrico)">
          <span className="text-sm text-slate-500">Métrico</span>
        </Row>
        <Row label="Sons" hint="Bips no timer de descanso e na corrida">
          <Toggle on={s.sound} onChange={(v) => up({ sound: v })} label="Sons" />
        </Row>
        <Row
          label="Voz"
          hint={
            speechSupported()
              ? 'Avisos em português na corrida'
              : 'Este navegador não tem síntese de voz'
          }
        >
          <div className="flex items-center gap-2">
            {speechSupported() && (
              <button
                className="btn-ghost min-h-9 px-2 text-xs"
                onClick={() => speak('Corra! Faltam trinta segundos.')}
              >
                Testar
              </button>
            )}
            <Toggle on={s.voice} onChange={(v) => up({ voice: v })} label="Voz" />
          </div>
        </Row>
        <Row
          label="Vibração"
          hint={
            'vibrate' in navigator
              ? 'Ao terminar descanso e trocar de bloco'
              : 'Sem suporte neste aparelho'
          }
        >
          <Toggle on={s.vibration} onChange={(v) => up({ vibration: v })} label="Vibração" />
        </Row>
        <Row label="Descanso padrão" hint="Entre séries; ajustável durante o treino">
          <select
            className="input min-h-10 w-auto px-2 py-0 text-sm"
            value={s.restSeconds}
            onChange={(e) => up({ restSeconds: Number(e.target.value) })}
            aria-label="Descanso padrão"
          >
            {[45, 60, 75, 90, 120, 150, 180].map((x) => (
              <option key={x} value={x}>
                {x} s
              </option>
            ))}
          </select>
        </Row>
        <Row
          label="Tela acesa no treino"
          hint={
            wakeLockSupported()
              ? 'Wake Lock disponível'
              : 'Sem suporte: desative o bloqueio automático do aparelho'
          }
        >
          <span className="text-sm text-slate-500">{wakeLockSupported() ? 'Sim' : 'Não'}</span>
        </Row>
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Plano</h2>
        <label className="label mt-3" htmlFor="start">
          Data de início (segunda-feira)
        </label>
        <input
          id="start"
          type="date"
          className="input"
          value={s.startDate}
          onChange={(e) =>
            e.target.value && up({ startDate: toISODate(mondayOf(fromISODate(e.target.value))) })
          }
        />
        {s.weekRepeats.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Semanas repetidas: {s.weekRepeats.map((r) => r.week).join(', ')}.{' '}
            <button className="underline" onClick={() => up({ weekRepeats: [] })}>
              Limpar repetições
            </button>
          </p>
        )}
        <p className="label mt-4">Dias de escritório</p>
        <div className="grid grid-cols-7 gap-1" role="group" aria-label="Dias de escritório">
          {ALL_DAYS.map((d) => {
            const on = s.officeDays.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  up({
                    officeDays: on ? s.officeDays.filter((x) => x !== d) : [...s.officeDays, d],
                  })
                }
                className={`min-h-11 rounded-xl text-sm font-semibold ${on ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                {WEEKDAY_SHORT[d]}
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div>
            <label className="label" htmlFor="h">
              Altura (cm)
            </label>
            <input
              id="h"
              className="input"
              inputMode="numeric"
              defaultValue={s.heightCm}
              onBlur={(e) => up({ heightCm: Number(e.target.value) || s.heightCm })}
            />
          </div>
          <div>
            <label className="label" htmlFor="w0">
              Peso inicial
            </label>
            <input
              id="w0"
              className="input"
              inputMode="decimal"
              defaultValue={s.startWeightKg}
              onBlur={(e) =>
                up({ startWeightKg: Number(e.target.value.replace(',', '.')) || s.startWeightKg })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="wt">
              Peso-alvo
            </label>
            <input
              id="wt"
              className="input"
              inputMode="decimal"
              defaultValue={s.targetWeightKg}
              onBlur={(e) =>
                up({ targetWeightKg: Number(e.target.value.replace(',', '.')) || s.targetWeightKg })
              }
            />
          </div>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Lembretes</h2>
        <p className="text-xs text-slate-500">
          {notificationsSupported()
            ? 'Notificações locais: funcionam com o app aberto ou instalado em segundo plano (varia por aparelho). Sem servidor, nada sai do seu celular.'
            : 'Este navegador não suporta notificações. No iPhone, instale o app na tela inicial (iOS 16.4+).'}
        </p>
        {notificationsSupported() && Notification.permission !== 'granted' && (
          <button
            className="btn-secondary mt-2 w-full"
            onClick={() =>
              void requestNotificationPermission().then((p) =>
                setMsg(
                  p === 'granted'
                    ? 'Notificações permitidas.'
                    : 'Permissão negada: ative nas configurações do navegador.',
                ),
              )
            }
          >
            <Icon name="bell" className="size-5" /> Permitir notificações
          </button>
        )}
        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
          <Row label="Mobilidade diária">
            <div className="flex items-center gap-2">
              <input
                type="time"
                className="input min-h-10 w-auto px-2 py-0 text-sm"
                value={s.reminders.mobility.time}
                onChange={(e) =>
                  up({
                    reminders: {
                      ...s.reminders,
                      mobility: { ...s.reminders.mobility, time: e.target.value },
                    },
                  })
                }
                aria-label="Horário da mobilidade"
              />
              <Toggle
                on={s.reminders.mobility.enabled}
                onChange={(v) =>
                  up({
                    reminders: {
                      ...s.reminders,
                      mobility: { ...s.reminders.mobility, enabled: v },
                    },
                  })
                }
                label="Lembrete de mobilidade"
              />
            </div>
          </Row>
          <Row label="Hora de dormir">
            <div className="flex items-center gap-2">
              <input
                type="time"
                className="input min-h-10 w-auto px-2 py-0 text-sm"
                value={s.reminders.sleep.time}
                onChange={(e) =>
                  up({
                    reminders: {
                      ...s.reminders,
                      sleep: { ...s.reminders.sleep, time: e.target.value },
                    },
                  })
                }
                aria-label="Horário de dormir"
              />
              <Toggle
                on={s.reminders.sleep.enabled}
                onChange={(v) =>
                  up({ reminders: { ...s.reminders, sleep: { ...s.reminders.sleep, enabled: v } } })
                }
                label="Lembrete de dormir"
              />
            </div>
          </Row>
          <Row label="Pesagem semanal">
            <div className="flex items-center gap-2">
              <select
                className="input min-h-10 w-16 px-1 py-0 text-sm"
                value={s.reminders.weighIn.weekday}
                onChange={(e) =>
                  up({
                    reminders: {
                      ...s.reminders,
                      weighIn: {
                        ...s.reminders.weighIn,
                        weekday: Number(e.target.value) as Weekday,
                      },
                    },
                  })
                }
                aria-label="Dia da pesagem"
              >
                {ALL_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {WEEKDAY_SHORT[d]}
                  </option>
                ))}
              </select>
              <input
                type="time"
                className="input min-h-10 w-auto px-2 py-0 text-sm"
                value={s.reminders.weighIn.time}
                onChange={(e) =>
                  up({
                    reminders: {
                      ...s.reminders,
                      weighIn: { ...s.reminders.weighIn, time: e.target.value },
                    },
                  })
                }
                aria-label="Horário da pesagem"
              />
              <Toggle
                on={s.reminders.weighIn.enabled}
                onChange={(v) =>
                  up({
                    reminders: { ...s.reminders, weighIn: { ...s.reminders.weighIn, enabled: v } },
                  })
                }
                label="Lembrete de pesagem"
              />
            </div>
          </Row>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Seus dados</h2>
        <p className="text-xs text-slate-500">
          Tudo fica só neste aparelho. Exporte um backup de vez em quando.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn-secondary" onClick={() => void doExport()}>
            <Icon name="download" className="size-5" /> Exportar
          </button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" className="size-5" /> Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => void doImport(e.target.files?.[0])}
          />
        </div>
        {!confirmClear ? (
          <button
            className="btn-ghost mt-2 w-full text-red-600 dark:text-red-400"
            onClick={() => setConfirmClear(true)}
          >
            <Icon name="trash" className="size-5" /> Apagar todos os dados
          </button>
        ) : (
          <div className="mt-3 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Apagar tudo? Não dá para desfazer. Exporte um backup antes.
            </p>
            <div className="mt-2 flex gap-2">
              <button className="btn-danger flex-1" onClick={() => void doClear()}>
                Sim, apagar tudo
              </button>
              <button className="btn-secondary" onClick={() => setConfirmClear(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>

      <nav
        className="card divide-y divide-slate-100 dark:divide-slate-800"
        aria-label="Mais páginas"
      >
        {[
          {
            to: '/seguranca',
            label: 'Segurança: regra da dor e sinais de alerta',
            icon: 'shield' as const,
          },
          { to: '/habitos', label: 'Hábitos: proteína, água, sono', icon: 'heart' as const },
          { to: '/sobre', label: 'Sobre, créditos e aviso de saúde', icon: 'info' as const },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="flex min-h-12 items-center gap-3 px-4 py-2">
            <Icon name={l.icon} className="size-5 text-brand-500" />
            <span className="flex-1 text-sm font-medium">{l.label}</span>
            <span aria-hidden="true" className="text-slate-400">
              ›
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
