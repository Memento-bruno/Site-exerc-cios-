import type {
  BasketballWorkout,
  BikeWorkout,
  Checkpoint,
  DayWorkout,
  ExerciseRef,
  Phase,
  Plan,
  RunStep,
  RunWorkout,
  Week,
} from './types';

/* ───────────────────────── Constantes gerais ───────────────────────── */

export const TOTAL_WEEKS = 24;
export const DELOAD_WEEKS = [4, 8, 12, 16, 20];

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Adaptação',
    subtitle: 'Aprender os movimentos e criar o hábito',
    weeks: [1, 4],
    targetWeightKg: [86, 87],
    description:
      'Cargas leves, 2 séries de 12, caminhadas e bike. O objetivo é chegar ao fim da semana sem piora das dores.',
    advanceRule: '3 das 4 semanas completas, sem piora das dores.',
    color: '#0ea5e9',
  },
  {
    id: 2,
    name: 'Base',
    subtitle: 'Primeiros trotes e 3 séries',
    weeks: [5, 8],
    targetWeightKg: [84, 85],
    description:
      'Entram goblet, supino e farmer carry. A corrida começa com intervalos de 1 minuto de trote.',
    advanceRule: 'Semana 7 completa sem dor acima de 3/10.',
    color: '#8b5cf6',
  },
  {
    id: 3,
    name: 'Construção',
    subtitle: 'Intervalos mais longos e cargas maiores',
    weeks: [9, 12],
    targetWeightKg: [82, 83],
    description:
      'Hip thrust, pallof press, afundo reverso e prancha lateral. Na semana 12, teste de 3 km contínuos.',
    advanceRule: 'Teste de 3 km contínuos na semana 12 e exames refeitos.',
    color: '#f59e0b',
  },
  {
    id: 4,
    name: '5 km contínuos',
    subtitle: 'Correr sem parar',
    weeks: [13, 16],
    targetWeightKg: [80, 81],
    description:
      'Força 3×6–8 e corridas contínuas até 4,5 km. Na semana 16, teste de 5 km contínuos.',
    advanceRule: '5 km contínuos na semana 16 (anote o tempo).',
    color: '#f97316',
  },
  {
    id: 5,
    name: 'Velocidade',
    subtitle: 'Abaixo de 30 minutos',
    weeks: [17, 24],
    targetWeightKg: [76, 78],
    description:
      'Tiros na esteira, corridas leves mais longas e força mantida. Na semana 24, teste de 5 km abaixo de 30 minutos.',
    advanceRule: 'Se não bater os 30 min, repita as semanas 21–24.',
    color: '#ef4444',
  },
];

export const CHECKPOINTS: Checkpoint[] = [
  { week: 0, run: '—', targetWeightKg: [88.7, 88.7], other: 'Exames e fotos de referência' },
  {
    week: 4,
    run: 'Caminhada de 40 min',
    targetWeightKg: [86, 87],
    other: 'Dores iguais ou menores',
  },
  { week: 8, run: 'Intervalos de 2 min', targetWeightKg: [84, 85], other: 'Medir a cintura' },
  { week: 12, run: '3 km contínuos', targetWeightKg: [82, 83], other: 'Repetir exames e fotos' },
  { week: 16, run: '5 km contínuos', targetWeightKg: [80, 81], other: 'Anotar o tempo dos 5 km' },
  {
    week: 24,
    run: '5 km abaixo de 30 min',
    targetWeightKg: [76, 78],
    other: 'Novas fotos e revisar a meta com o médico',
  },
];

export const TIPS = [
  'No fretado: apoio lombar e chin tuck a cada 15–20 minutos.',
  'No home office: 2 minutos de mobilidade a cada hora.',
  'Bike: joelho levemente dobrado (25–30°) com o pedal embaixo.',
  'Carga: as últimas 2 repetições difíceis, sem perder a postura. Quando fizer todas as séries com folga, suba o peso.',
  'Deload (semanas 4, 8, 12, 16 e 20): cerca de 30% menos volume.',
  'Caminhada rápida ≈ 6 km/h: dá para falar frases curtas, não para cantar.',
];

export const DAILY_MOBILITY: ExerciseRef[] = [
  { exerciseId: 'gato-vaca', sets: 1, reps: 10 },
  { exerciseId: 'flexor-quadril-ajoelhado', sets: 1, seconds: 30, perSide: true },
  { exerciseId: 'open-book', sets: 1, reps: 8, perSide: true },
  { exerciseId: 'wall-slide', sets: 1, reps: 10 },
  { exerciseId: 'chin-tuck', sets: 1, reps: 10 },
  { exerciseId: 'posterior-faixa-deitado', sets: 1, seconds: 30, perSide: true, note: 'Suave' },
  { exerciseId: 'alongamento-peito-porta', sets: 1, seconds: 30 },
];

/* ───────────────────────── Treinos de força por fase ───────────────────────── */

type StrengthTemplates = Record<
  number,
  { A: ExerciseRef[]; B: ExerciseRef[]; mini: ExerciseRef[] }
>;

const STRENGTH: StrengthTemplates = {
  1: {
    A: [
      {
        exerciseId: 'leg-press',
        sets: 2,
        reps: 12,
        suggestedLoad: 'leve',
        note: 'Ou sentar e levantar do banco',
      },
      { exerciseId: 'remada-maquina', sets: 2, reps: 12 },
      { exerciseId: 'ponte-gluteo', sets: 2, reps: 12 },
      { exerciseId: 'flexao-inclinada', sets: 2, reps: 12 },
      { exerciseId: 'dead-bug', sets: 2, reps: 6, perSide: true },
    ],
    B: [
      { exerciseId: 'terra-romeno', sets: 2, reps: 12, suggestedLoad: 'bastão ou 4–6 kg' },
      { exerciseId: 'step-up', sets: 2, reps: 8, perSide: true, note: 'Degrau de 20 cm' },
      { exerciseId: 'puxada-pulley', sets: 2, reps: 12 },
      { exerciseId: 'desenvolvimento-halteres', sets: 2, reps: 12, suggestedLoad: 'leve' },
      { exerciseId: 'bird-dog', sets: 2, reps: 6, perSide: true },
    ],
    mini: [
      { exerciseId: 'ponte-gluteo', sets: 2, reps: 10 },
      { exerciseId: 'remada-elastico', sets: 2, reps: 10, note: 'Ou remada no cabo' },
      { exerciseId: 'dead-bug', sets: 2, reps: 10, perSide: true },
      { exerciseId: 'chin-tuck', sets: 2, reps: 10 },
    ],
  },
  2: {
    A: [
      { exerciseId: 'agachamento-goblet', sets: 3, reps: 10, note: 'Novo' },
      { exerciseId: 'remada-halter-banco', sets: 3, reps: 10, perSide: true },
      { exerciseId: 'ponte-gluteo-halter', sets: 3, reps: 10 },
      { exerciseId: 'supino-halteres', sets: 3, reps: 10, note: 'Novo' },
      { exerciseId: 'dead-bug', sets: 3, reps: 8, perSide: true },
    ],
    B: [
      { exerciseId: 'terra-romeno', sets: 3, reps: 10, suggestedLoad: '8–12 kg' },
      { exerciseId: 'step-up', sets: 3, reps: 8, perSide: true, note: 'Degrau de 30–40 cm' },
      { exerciseId: 'puxada-pulley', sets: 3, reps: 10 },
      { exerciseId: 'desenvolvimento-halteres', sets: 3, reps: 10 },
      { exerciseId: 'farmer-carry', sets: 3, meters: 30, note: 'Novo' },
    ],
    mini: [
      { exerciseId: 'ponte-gluteo', sets: 2, reps: 12 },
      { exerciseId: 'remada-maquina', sets: 2, reps: 12, note: 'No cabo' },
      { exerciseId: 'prancha', sets: 3, seconds: 20 },
    ],
  },
  3: {
    A: [
      { exerciseId: 'agachamento-goblet', sets: 3, reps: '8–10', suggestedLoad: 'mais pesado' },
      { exerciseId: 'remada-halter-banco', sets: 3, reps: '8–10', perSide: true },
      { exerciseId: 'hip-thrust-banco', sets: 3, reps: '8–10', note: 'Novo' },
      { exerciseId: 'supino-halteres', sets: 3, reps: '8–10' },
      { exerciseId: 'pallof-press', sets: 3, reps: 10, perSide: true, note: 'Novo' },
    ],
    B: [
      { exerciseId: 'terra-romeno', sets: 3, reps: '8–10', suggestedLoad: '12–18 kg' },
      { exerciseId: 'afundo-reverso', sets: 3, reps: 8, perSide: true, note: 'Novo' },
      { exerciseId: 'puxada-pulley', sets: 3, reps: '8–10' },
      { exerciseId: 'desenvolvimento-halteres', sets: 3, reps: '8–10' },
      { exerciseId: 'prancha-lateral', sets: 3, seconds: 25, perSide: true, note: 'Novo, 20–30 s' },
      { exerciseId: 'farmer-carry', sets: 3, meters: 40 },
    ],
    mini: [
      { exerciseId: 'ponte-gluteo', sets: 2, reps: 12 },
      { exerciseId: 'remada-maquina', sets: 2, reps: 12, note: 'No cabo' },
      { exerciseId: 'prancha', sets: 3, seconds: 20 },
    ],
  },
  4: {
    A: [
      {
        exerciseId: 'agachamento-goblet',
        sets: 3,
        reps: '6–8',
        suggestedLoad: 'pesado',
        note: 'Ou com barra',
      },
      { exerciseId: 'remada-halter-banco', sets: 3, reps: '6–8', perSide: true },
      { exerciseId: 'hip-thrust-banco', sets: 3, reps: '6–8' },
      { exerciseId: 'supino-halteres', sets: 3, reps: '6–8' },
      { exerciseId: 'panturrilha-degrau', sets: 3, reps: 15, note: 'Novo' },
      { exerciseId: 'pallof-press', sets: 3, reps: 10, perSide: true },
    ],
    B: [
      { exerciseId: 'terra-romeno', sets: 3, reps: '6–8', suggestedLoad: 'pesado' },
      {
        exerciseId: 'terra-romeno-unilateral',
        sets: 3,
        reps: 8,
        perSide: true,
        suggestedLoad: 'leve',
        note: 'Novo',
      },
      { exerciseId: 'afundo-reverso', sets: 3, reps: '6–8', perSide: true, note: 'Com halteres' },
      { exerciseId: 'puxada-pulley', sets: 3, reps: '6–8' },
      { exerciseId: 'desenvolvimento-halteres', sets: 3, reps: '6–8' },
      { exerciseId: 'prancha-lateral', sets: 3, seconds: 30, perSide: true },
    ],
    mini: [
      { exerciseId: 'ponte-gluteo', sets: 2, reps: 12 },
      { exerciseId: 'remada-maquina', sets: 2, reps: 12, note: 'No cabo' },
      { exerciseId: 'prancha', sets: 3, seconds: 20 },
    ],
  },
};
// Fase 5: mesmos exercícios da Fase 4, com saltos opcionais no início da Força A.
STRENGTH[5] = {
  A: [
    {
      exerciseId: 'saltos-step',
      sets: 3,
      reps: 5,
      optional: true,
      note: 'Opcional, só sem dor no joelho',
    },
    ...STRENGTH[4].A.map((r) => ({ ...r, note: r.note?.replace('Novo', '').trim() || undefined })),
  ],
  B: STRENGTH[4].B.map((r) => ({ ...r, note: r.note?.replace('Novo', '').trim() || undefined })),
  mini: STRENGTH[4].mini,
};

/* ───────────────────────── Cardio por semana ───────────────────────── */

const W = (min: number): RunStep => ({ type: 'walk', min });
const R = (min: number, speedKmh?: number): RunStep => ({ type: 'run', min, speedKmh });
const REP = (times: number, run: number, walk: number): RunStep => ({
  type: 'repeat',
  times,
  steps: [R(run), W(walk)],
});
const WU = (min: number): RunStep => ({ type: 'warmup', min });
const CD = (min: number): RunStep => ({ type: 'cooldown', min });

const walk = (min: number, inclinePct?: number): RunWorkout => ({
  title: `Caminhada rápida ${min} min`,
  mode: 'caminhada',
  steps: [{ type: 'walk', min, label: 'Caminhada rápida' }],
  inclinePct,
  speedKmh: 6,
  note: inclinePct ? `Inclinação de ${inclinePct}%` : undefined,
});

const intervals = (runMin: number, walkMin: number, times: number, extra?: string): RunWorkout => ({
  title: `${fmtMin(runMin)} corre + ${fmtMin(walkMin)} anda ×${times}`,
  mode: 'intervalos',
  steps: [WU(5), REP(times, runMin, walkMin), CD(5)],
  speedKmh: 7.75,
  note: extra ?? 'Trote a 7,5–8 km/h. 5 min de caminhada antes e depois.',
});

const continuous = (min: number, note?: string): RunWorkout => ({
  title: `${min} min contínuos`,
  mode: 'continua',
  steps: [WU(5), { type: 'run', min, label: 'Corrida contínua' }, CD(5)],
  note: note ?? 'Ritmo confortável. Se precisar, ande 1 min e volte a correr.',
});

const distance = (km: number, note?: string): RunWorkout => ({
  title: `${fmtKm(km)} km`,
  mode: 'distancia',
  steps: [],
  distanceKm: km,
  location: 'rua',
  note: note ?? 'Ritmo confortável. Se precisar, ande 1 min e volte a correr.',
});

const sprints = (times: number, meters: number, speedKmh: number): RunWorkout => ({
  title: `${times}×${meters} m a ${speedKmh.toLocaleString('pt-BR')} km/h`,
  mode: 'tiros',
  steps: [
    WU(10),
    { type: 'repeat', times, steps: [{ type: 'run', meters, speedKmh, label: 'Tiro' }, W(2)] },
    CD(5),
  ],
  speedKmh,
  location: 'esteira',
  note: '10 min de trote antes; 2 min andando entre os tiros.',
});

function fmtMin(min: number) {
  if (Number.isInteger(min)) return `${min}`;
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtKm(km: number) {
  return km.toLocaleString('pt-BR');
}

interface WeekCardio {
  fri: RunWorkout;
  sat: RunWorkout;
  tue: BikeWorkout;
  thu: BikeWorkout | RunWorkout;
  /** Quinta vira corrida leve (Fase 5) ou descanso. */
  thuKind?: 'bike' | 'corrida' | 'descanso';
}

const bike = (minutes: number, note?: string): BikeWorkout => ({ minutes, note });
const bikeHard = (minutes: number, count: number): BikeWorkout => ({
  minutes,
  intervals: { count, hardSec: 30, easySec: 90 },
  note: `${count}×30 s forte, 90 s leve entre eles`,
});
const easyRun = (min: number): RunWorkout => ({
  title: `Corrida leve ${min} min`,
  mode: 'continua',
  steps: [WU(3), { type: 'run', min, label: 'Corrida leve' }, CD(2)],
  note: 'Bem leve, dá para conversar.',
});

const CARDIO: Record<number, WeekCardio> = {
  // Fase 1
  1: { fri: walk(15), sat: walk(30), tue: bike(15), thu: bike(15) },
  2: { fri: walk(20), sat: walk(35), tue: bike(15), thu: bike(15) },
  3: { fri: walk(20, 1), sat: walk(40), tue: bike(20), thu: bike(20) },
  4: { fri: walk(15), sat: walk(30), tue: bike(15), thu: bike(15) },
  // Fase 2
  5: { fri: intervals(1, 2, 6), sat: intervals(1, 2, 8), tue: bike(20), thu: bike(20) },
  6: { fri: intervals(1.5, 2, 6), sat: intervals(1.5, 2, 8), tue: bike(20), thu: bike(20) },
  7: { fri: intervals(2, 2, 6), sat: intervals(2, 2, 7), tue: bike(25), thu: bike(25) },
  8: { fri: intervals(1.5, 2, 5), sat: walk(40), tue: bike(20), thu: bike(20) },
  // Fase 3
  9: { fri: intervals(3, 1.5, 5), sat: intervals(3, 1.5, 6), tue: bike(25), thu: bikeHard(20, 6) },
  10: {
    fri: intervals(5, 2, 3),
    sat: {
      title: '8 corre + 2 anda ×2, + 5 corre',
      mode: 'intervalos',
      steps: [WU(5), REP(2, 8, 2), { type: 'run', min: 5, label: 'Corrida final' }, CD(5)],
      note: 'Trote confortável.',
    },
    tue: bike(25),
    thu: bikeHard(20, 6),
  },
  11: { fri: intervals(8, 2, 2), sat: continuous(15), tue: bike(25), thu: bikeHard(20, 6) },
  12: {
    fri: intervals(5, 2, 3),
    sat: {
      title: 'Teste: 3 km contínuos',
      mode: 'teste',
      steps: [],
      distanceKm: 3,
      note: 'Checkpoint da semana 12. Ritmo confortável, sem parar.',
    },
    tue: bike(20),
    thu: bike(20),
  },
  // Fase 4
  13: { fri: continuous(20), sat: distance(3.5), tue: bike(25), thu: bikeHard(25, 8) },
  14: { fri: continuous(20), sat: distance(4), tue: bike(25), thu: bikeHard(25, 8) },
  15: { fri: continuous(25), sat: distance(4.5), tue: bike(25), thu: bikeHard(25, 8) },
  16: {
    fri: continuous(15, 'Bem leve: é semana de teste.'),
    sat: {
      title: 'Teste: 5 km contínuos',
      mode: 'teste',
      steps: [],
      distanceKm: 5,
      note: 'Checkpoint da semana 16. Registre o tempo.',
    },
    tue: bike(20),
    thu: bike(20),
  },
  // Fase 5
  17: { fri: sprints(6, 400, 10.4), sat: distance(5, 'Leve.'), tue: bike(25), thu: bike(25) },
  18: {
    fri: sprints(4, 800, 10),
    sat: distance(5.5, 'Leve.'),
    tue: bike(25),
    thu: easyRun(20),
    thuKind: 'corrida',
  },
  19: {
    fri: sprints(8, 400, 10.6),
    sat: distance(6, 'Leve.'),
    tue: bike(25),
    thu: easyRun(20),
    thuKind: 'corrida',
  },
  20: {
    fri: continuous(20, 'Semana leve: 20 min bem leves.'),
    sat: distance(5, 'Leve.'),
    tue: bike(20),
    thu: bike(20),
  },
  21: {
    fri: {
      title: '2 km a 9,7 km/h + 1 km a 10 km/h',
      mode: 'tiros',
      steps: [
        WU(10),
        { type: 'run', meters: 2000, speedKmh: 9.7, label: '2 km' },
        { type: 'run', meters: 1000, speedKmh: 10, label: '1 km' },
        CD(5),
      ],
      location: 'esteira',
      note: 'Contínuo, sem parar entre os dois trechos.',
    },
    sat: distance(6, 'Leve.'),
    tue: bike(25),
    thu: easyRun(25),
    thuKind: 'corrida',
  },
  22: {
    fri: sprints(5, 800, 10.2),
    sat: distance(6.5, 'Leve.'),
    tue: bike(25),
    thu: easyRun(25),
    thuKind: 'corrida',
  },
  23: {
    fri: sprints(3, 1000, 10.2),
    sat: distance(5, 'Leve.'),
    tue: bike(25),
    thu: easyRun(20),
    thuKind: 'corrida',
  },
  24: {
    fri: {
      title: '15 min leves + 4 acelerações de 20 s',
      mode: 'continua',
      steps: [
        { type: 'run', min: 15, label: 'Corrida leve' },
        { type: 'repeat', times: 4, steps: [{ type: 'fast', sec: 20, label: 'Aceleração' }, W(1)] },
        CD(3),
      ],
      note: 'Soltar as pernas para o teste.',
    },
    sat: {
      title: 'Teste: 5 km abaixo de 30 min',
      mode: 'teste',
      steps: [],
      distanceKm: 5,
      targetTimeMin: 30,
      note: 'Estratégia: 1º km a 6:05/km, do 2º ao 4º a 6:00, o último com o que sobrar.',
    },
    tue: bike(20),
    thu: { minutes: 0 },
    thuKind: 'descanso',
  },
};

/* ───────────────────────── Basquete por fase ───────────────────────── */

const BASKETBALL: Record<number, BasketballWorkout> = {
  1: {
    minutes: 20,
    drillIds: ['drible-parado', 'arremesso-curto'],
    note: 'Drible parado (direita, esquerda, alternando, 1 min cada); arremesso a 1–2 m. Sem saltos.',
  },
  2: {
    minutes: 25,
    drillIds: ['drible-andando', 'bandeja-andando', 'arremesso-curto'],
    note: 'Drible andando com as duas mãos; bandeja andando dos dois lados; arremesso a 2–3 m.',
  },
  3: {
    minutes: 30,
    drillIds: ['crossover', 'arremesso-5-posicoes', 'bandeja-trote'],
    note: 'Saltos pequenos só se joelho e posterior estiverem bem.',
  },
  4: {
    minutes: 35,
    drillIds: ['arremesso-movimento', 'jogo-21', 'um-contra-um'],
    note: '30–40 min. Arremesso em movimento, jogo de "21", 1 contra 1 leve.',
  },
  5: {
    minutes: 35,
    drillIds: ['rachao', 'um-contra-um'],
    note: 'Rachão ou 1 contra 1, com aquecimento de 5 min e tênis de quadra.',
  },
};

/* ───────────────────────── Montagem das semanas ───────────────────────── */

export function phaseForWeek(week: number): Phase {
  const p = PHASES.find((ph) => week >= ph.weeks[0] && week <= ph.weeks[1]);
  return p ?? PHASES[PHASES.length - 1];
}

/** Deload: ~30% menos volume. Reduz uma série quando há 3+, senão reduz as repetições. */
export function applyDeload(ref: ExerciseRef): ExerciseRef {
  if (ref.sets >= 3) return { ...ref, sets: ref.sets - 1 };
  if (typeof ref.reps === 'number')
    return { ...ref, reps: Math.max(5, Math.round(ref.reps * 0.7)) };
  if (ref.seconds) return { ...ref, seconds: Math.round(ref.seconds * 0.7) };
  if (ref.meters) return { ...ref, meters: Math.round(ref.meters * 0.7) };
  return ref;
}

function strengthMinutes(refs: ExerciseRef[]) {
  const sets = refs.reduce((n, r) => n + r.sets * (r.perSide ? 1.5 : 1), 0);
  return Math.round(10 + sets * 1.6);
}

function runMinutes(run: RunWorkout): number {
  if (run.distanceKm) return Math.round(run.distanceKm * 7) + 5;
  const walkSteps = (steps: RunWorkout['steps']): number =>
    steps.reduce((acc, s) => {
      if (s.type === 'repeat') return acc + s.times * walkSteps(s.steps);
      if (s.type === 'fast') return acc + s.sec / 60;
      if (s.type === 'run') {
        if (s.min) return acc + s.min;
        if (s.meters && s.speedKmh) return acc + (s.meters / 1000 / s.speedKmh) * 60;
        return acc;
      }
      return acc + s.min;
    }, 0);
  return Math.ceil(walkSteps(run.steps));
}

function buildWeek(number: number): Week {
  const phase = phaseForWeek(number);
  const deload = DELOAD_WEEKS.includes(number);
  const tpl = STRENGTH[phase.id];
  const cardio = CARDIO[number];
  const bb = BASKETBALL[phase.id];
  const dl = (refs: ExerciseRef[]) => (deload ? refs.map(applyDeload) : refs);
  const A = dl(tpl.A);
  const B = dl(tpl.B);
  const id = (d: string) => `w${String(number).padStart(2, '0')}-${d}`;

  const thuKind = cardio.thuKind ?? 'bike';
  const thu: DayWorkout =
    thuKind === 'descanso'
      ? {
          id: id('qui'),
          weekday: 4,
          type: 'descanso',
          title: 'Descanso',
          estimatedMin: 10,
          light: true,
          mobilityFirst: true,
          notes: ['Véspera do teste: só a mobilidade diária.'],
        }
      : thuKind === 'corrida'
        ? {
            id: id('qui'),
            weekday: 4,
            type: 'corrida',
            title: (cardio.thu as RunWorkout).title,
            estimatedMin: runMinutes(cardio.thu as RunWorkout) + 10,
            light: true,
            optional: true,
            mobilityFirst: true,
            run: cardio.thu as RunWorkout,
            notes: ['Opcional. Pode trocar por bike leve.'],
          }
        : {
            id: id('qui'),
            weekday: 4,
            type: 'bike',
            title: `Bike leve ${(cardio.thu as BikeWorkout).minutes} min + mobilidade`,
            estimatedMin: (cardio.thu as BikeWorkout).minutes + 10,
            light: true,
            mobilityFirst: true,
            bike: cardio.thu as BikeWorkout,
          };

  const wedMini = tpl.mini;
  const wed: DayWorkout =
    phase.id === 1
      ? {
          id: id('qua'),
          weekday: 3,
          type: 'mini',
          title: 'Treino mini 20 min (opcional)',
          estimatedMin: 20,
          light: true,
          optional: true,
          mobilityFirst: true,
          exercises: wedMini,
          notes: ['Ou descanso.'],
        }
      : {
          id: id('qua'),
          weekday: 3,
          type: 'mini',
          title: phase.id === 2 ? 'Bike 15 min + treino mini' : 'Bike 20 min ou treino mini',
          estimatedMin: 20,
          light: true,
          optional: true,
          mobilityFirst: true,
          bike: { minutes: phase.id === 2 ? 15 : 20 },
          exercises: wedMini,
          notes:
            phase.id === 2
              ? ['15 min de bike + ponte, remada no cabo, prancha 3×20 s.']
              : ['20 min de bike ou o treino mini da Fase 2. Ou descanso.'],
        };

  const days: DayWorkout[] = [
    {
      id: id('seg'),
      weekday: 1,
      type: 'forca',
      title: 'Força A',
      estimatedMin: strengthMinutes(A) + 10,
      mobilityFirst: true,
      exercises: A,
      notes: ['Na academia, de manhã, no horário do fretado.'],
    },
    {
      id: id('ter'),
      weekday: 2,
      type: 'bike',
      title: `Bike leve ${cardio.tue.minutes} min`,
      estimatedMin: cardio.tue.minutes + 10,
      light: true,
      mobilityFirst: true,
      bike: cardio.tue,
    },
    wed,
    thu,
    {
      id: id('sex'),
      weekday: 5,
      type: 'forca',
      title: `Força B + ${cardio.fri.title}`,
      estimatedMin: strengthMinutes(B) + runMinutes(cardio.fri) + 10,
      mobilityFirst: true,
      exercises: B,
      run: { ...cardio.fri, location: cardio.fri.location ?? 'esteira' },
      notes: ['Corrida na esteira depois da força.'],
    },
    {
      id: id('sab'),
      weekday: 6,
      type: cardio.sat.mode === 'caminhada' ? 'caminhada' : 'corrida',
      title: cardio.sat.title,
      estimatedMin: runMinutes(cardio.sat) + 10,
      mobilityFirst: true,
      run: cardio.sat,
    },
    {
      id: id('dom'),
      weekday: 0,
      type: 'basquete',
      title: `Basquete ${bb.minutes} min`,
      estimatedMin: bb.minutes + 10,
      optional: true,
      mobilityFirst: true,
      basketball: bb,
      notes: ['Ou descanso ativo.'],
    },
  ];

  const notes: string[] = [];
  if (deload) notes.push('Semana leve: cerca de 30% menos volume.');
  if (number === 12)
    notes.push('Refazer exames (TSH/T4 livre, ferritina, B12, vitamina D) e fotos.');
  if (number === 8) notes.push('Medir a cintura.');
  if (number === 16) notes.push('Teste de 5 km contínuos no sábado: anote o tempo.');
  if (number === 24)
    notes.push(
      'Teste final: 5 km abaixo de 30 min. Depois, novas fotos e revisar a meta com o médico.',
    );

  return { number, phaseId: phase.id, deload, days, notes: notes.length ? notes : undefined };
}

export const PAIN_DAY_WORKOUT: DayWorkout = {
  id: 'dia-de-dor',
  weekday: 0,
  type: 'dor',
  title: 'Dia de dor: treino leve',
  estimatedMin: 30,
  light: true,
  mobilityFirst: true,
  bike: { minutes: 15, note: 'Bem leve, dá para conversar.' },
  exercises: [{ exerciseId: 'respiracao-diafragmatica', sets: 1, seconds: 300 }],
  notes: [
    'Mobilidade completa + 15 min de bike leve + respiração diafragmática 5 min.',
    'Nada de corrida ou carga.',
  ],
};

export const WEEKS: Week[] = Array.from({ length: TOTAL_WEEKS }, (_, i) => buildWeek(i + 1));

export const PLAN: Plan = {
  phases: PHASES,
  weeks: WEEKS,
  checkpoints: CHECKPOINTS,
  dailyMobility: DAILY_MOBILITY,
  painDayWorkout: PAIN_DAY_WORKOUT,
  tips: TIPS,
  deloadWeeks: DELOAD_WEEKS,
  totalWeeks: TOTAL_WEEKS,
};

export function getWeek(number: number): Week {
  const w = WEEKS[Math.min(Math.max(number, 1), TOTAL_WEEKS) - 1];
  return w;
}

export function getDayWorkout(week: number, weekday: number): DayWorkout {
  const w = getWeek(week);
  return w.days.find((d) => d.weekday === weekday) ?? w.days[0];
}
