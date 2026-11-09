/** Tipos do conteúdo do plano. Dados em plan.ts e exercises.ts. */

export type Category = 'forca' | 'mobilidade' | 'corrida' | 'basquete' | 'respiracao';

export type Equipment = 'academia' | 'casa' | 'bike' | 'esteira' | 'bola' | 'sem-equipamento';

export type PainRegion =
  'posterior-direita' | 'lombar' | 'escapulas' | 'costela' | 'pescoco' | 'punhos' | 'joelho';

export const PAIN_REGIONS: { id: PainRegion; label: string }[] = [
  { id: 'posterior-direita', label: 'Posterior da coxa direita' },
  { id: 'lombar', label: 'Lombar' },
  { id: 'escapulas', label: 'Escápulas' },
  { id: 'costela', label: 'Abaixo da costela esquerda' },
  { id: 'pescoco', label: 'Pescoço' },
  { id: 'punhos', label: 'Punhos e mãos' },
  { id: 'joelho', label: 'Joelho direito' },
];

export interface ExerciseMedia {
  /** Pasta no free-exercise-db (2 fotos: 0.jpg e 1.jpg). */
  datasetFolder?: string;
  /** Chave em svg-keyframes.ts para o boneco animado. */
  svgKeyframes?: string;
  /** Caminho de vídeo próprio (public/media/exercises/<id>/demo.mp4). Detectado em tempo de execução. */
  video?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  equipment: Equipment[];
  muscles: string[];
  steps: string[];
  commonMistakes: string[];
  /** Cuidados ligados às dores do usuário. */
  cautions: string[];
  /** Ids de exercícios que podem substituir este. */
  substitutes: string[];
  media: ExerciseMedia;
  videoSearchUrl: string;
  /** Se verdadeiro, registra carga (kg) nas séries. */
  tracksLoad?: boolean;
}

export interface ExerciseRef {
  exerciseId: string;
  sets: number;
  /** Repetições por série (número ou faixa como "8–10"). */
  reps?: number | string;
  /** Tempo por série, em segundos (pranchas, alongamentos). */
  seconds?: number;
  /** Distância por série, em metros (farmer carry). */
  meters?: number;
  perSide?: boolean;
  suggestedLoad?: string;
  note?: string;
  optional?: boolean;
}

/** Passos de uma corrida; "repeat" aninha um bloco repetido. */
export type RunStep =
  | { type: 'warmup'; min: number; label?: string }
  | { type: 'cooldown'; min: number; label?: string }
  | { type: 'walk'; min: number; label?: string }
  | { type: 'run'; min?: number; meters?: number; speedKmh?: number; label?: string }
  | { type: 'fast'; sec: number; label?: string }
  | { type: 'repeat'; times: number; steps: RunStep[] };

export type RunMode = 'caminhada' | 'intervalos' | 'continua' | 'distancia' | 'tiros' | 'teste';

export interface RunWorkout {
  title: string;
  mode: RunMode;
  /** Passos cronometrados (vazio quando a corrida é só por distância). */
  steps: RunStep[];
  /** Meta em km para corridas por distância ou testes. */
  distanceKm?: number;
  /** Tempo-alvo em minutos (teste dos 5 km). */
  targetTimeMin?: number;
  speedKmh?: number;
  inclinePct?: number;
  location?: 'esteira' | 'rua';
  note?: string;
}

export interface BikeWorkout {
  minutes: number;
  /** Tiros curtos opcionais na bike (ex.: 6×30 s forte). */
  intervals?: { count: number; hardSec: number; easySec: number };
  note?: string;
}

export interface BasketballWorkout {
  minutes: number;
  drillIds: string[];
  note?: string;
}

export type WorkoutType =
  'forca' | 'bike' | 'corrida' | 'caminhada' | 'basquete' | 'mini' | 'descanso' | 'dor';

/** 0 = domingo … 6 = sábado (igual a Date#getDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DayWorkout {
  id: string;
  weekday: Weekday;
  type: WorkoutType;
  title: string;
  estimatedMin: number;
  /** Dia leve (escritório ou deload). */
  light?: boolean;
  optional?: boolean;
  mobilityFirst: boolean;
  exercises?: ExerciseRef[];
  run?: RunWorkout;
  bike?: BikeWorkout;
  basketball?: BasketballWorkout;
  notes?: string[];
}

export interface Week {
  number: number;
  phaseId: number;
  deload: boolean;
  days: DayWorkout[];
  /** Observações da semana (ex.: "Semana 12: refazer exames e fotos"). */
  notes?: string[];
}

export interface Phase {
  id: number;
  name: string;
  subtitle: string;
  weeks: [number, number];
  targetWeightKg: [number, number];
  description: string;
  advanceRule: string;
  color: string;
}

export interface Checkpoint {
  week: number;
  run: string;
  targetWeightKg: [number, number];
  other: string;
}

export interface Plan {
  phases: Phase[];
  weeks: Week[];
  checkpoints: Checkpoint[];
  dailyMobility: ExerciseRef[];
  painDayWorkout: DayWorkout;
  tips: string[];
  deloadWeeks: number[];
  totalWeeks: number;
}
