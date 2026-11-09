/**
 * Quadros do boneco de palito para exercícios sem foto no dataset.
 * Coordenadas num viewBox 0..100 (x) × 0..100 (y). Cada quadro define as articulações;
 * o componente interpola entre quadros em loop (ida e volta).
 */

export type Joint =
  | 'head'
  | 'neck'
  | 'hip'
  | 'shoulderL'
  | 'shoulderR'
  | 'elbowL'
  | 'elbowR'
  | 'handL'
  | 'handR'
  | 'kneeL'
  | 'kneeR'
  | 'footL'
  | 'footR';

export type Point = [number, number];
export type Frame = Record<Joint, Point>;

export interface StickFigureSpec {
  frames: Frame[];
  /** Duração de cada transição em ms (velocidade normal). */
  stepMs?: number;
  /** Se verdadeiro, volta ao primeiro quadro no fim em vez de inverter. */
  loop?: boolean;
  /** Linhas de cenário (chão, parede, banco, bola) desenhadas atrás do boneco. */
  props?: {
    type: 'line' | 'circle' | 'rect';
    coords: number[];
    dashed?: boolean;
    moving?: boolean;
  }[];
  /** Objeto que acompanha uma articulação (ex.: bola na mão). */
  held?: { joint: Joint; radius: number; offset?: Point };
  caption?: [string, string];
}

const f = (
  head: Point,
  neck: Point,
  hip: Point,
  shoulderL: Point,
  shoulderR: Point,
  elbowL: Point,
  elbowR: Point,
  handL: Point,
  handR: Point,
  kneeL: Point,
  kneeR: Point,
  footL: Point,
  footR: Point,
): Frame => ({
  head,
  neck,
  hip,
  shoulderL,
  shoulderR,
  elbowL,
  elbowR,
  handL,
  handR,
  kneeL,
  kneeR,
  footL,
  footR,
});

const GROUND = { type: 'line' as const, coords: [2, 92, 98, 92] };

export const SVG_KEYFRAMES: Record<string, StickFigureSpec> = {
  /* Deitado de lado, joelhos dobrados; braço de cima abre como um livro. */
  'open-book': {
    stepMs: 1400,
    props: [GROUND],
    caption: ['Braços juntos à frente', 'Abra o braço de cima e gire o tronco'],
    frames: [
      f(
        [18, 72],
        [26, 74],
        [56, 78],
        [26, 74],
        [26, 74],
        [40, 62],
        [40, 60],
        [52, 52],
        [52, 50],
        [66, 60],
        [66, 60],
        [80, 70],
        [80, 70],
      ),
      f(
        [18, 72],
        [26, 74],
        [56, 78],
        [26, 74],
        [26, 74],
        [40, 62],
        [20, 58],
        [52, 52],
        [10, 60],
        [66, 60],
        [66, 60],
        [80, 70],
        [80, 70],
      ),
    ],
  },
  /* Em pé, costas na parede; braços em W deslizando para cima. */
  'wall-slide': {
    stepMs: 1300,
    props: [GROUND, { type: 'line', coords: [58, 4, 58, 92] }],
    caption: ['Cotovelos a 90°, costas na parede', 'Deslize os braços até esticar'],
    frames: [
      f(
        [52, 14],
        [52, 24],
        [53, 54],
        [52, 26],
        [52, 26],
        [38, 30],
        [66, 30],
        [36, 14],
        [68, 14],
        [46, 74],
        [60, 74],
        [44, 92],
        [62, 92],
      ),
      f(
        [52, 14],
        [52, 24],
        [53, 54],
        [52, 26],
        [52, 26],
        [44, 12],
        [60, 12],
        [42, -2],
        [62, -2],
        [46, 74],
        [60, 74],
        [44, 92],
        [62, 92],
      ),
    ],
  },
  /* Perfil sentado: a cabeça desliza para trás (papada). */
  'chin-tuck': {
    stepMs: 1100,
    props: [
      GROUND,
      { type: 'line', coords: [40, 60, 70, 60] },
      { type: 'line', coords: [40, 60, 40, 92] },
    ],
    caption: ['Cabeça à frente', 'Queixo para trás, sem inclinar'],
    frames: [
      f(
        [62, 18],
        [54, 30],
        [50, 60],
        [54, 30],
        [54, 30],
        [60, 44],
        [60, 44],
        [70, 52],
        [70, 52],
        [74, 62],
        [74, 62],
        [74, 92],
        [74, 92],
      ),
      f(
        [53, 16],
        [53, 30],
        [50, 60],
        [53, 30],
        [53, 30],
        [60, 44],
        [60, 44],
        [70, 52],
        [70, 52],
        [74, 62],
        [74, 62],
        [74, 92],
        [74, 92],
      ),
    ],
  },
  /* Deitado de costas, barriga sobe e desce. */
  respiracao: {
    stepMs: 2000,
    props: [GROUND, { type: 'circle', coords: [52, 74, 8], moving: true }],
    caption: ['Inspire: barriga sobe', 'Expire: barriga desce'],
    frames: [
      f(
        [12, 80],
        [20, 82],
        [52, 82],
        [20, 82],
        [20, 82],
        [32, 72],
        [32, 72],
        [50, 66],
        [50, 66],
        [68, 68],
        [68, 68],
        [82, 90],
        [82, 90],
      ),
      f(
        [12, 80],
        [20, 82],
        [52, 82],
        [20, 82],
        [20, 82],
        [32, 74],
        [32, 74],
        [50, 72],
        [50, 72],
        [68, 68],
        [68, 68],
        [82, 90],
        [82, 90],
      ),
    ],
  },
  /* Em pé sobre uma perna, tronco inclina e a outra perna vai para trás. */
  'terra-romeno-unilateral': {
    stepMs: 1500,
    props: [GROUND],
    held: { joint: 'handR', radius: 3 },
    caption: ['Em pé, halter na mão', 'Incline o tronco, perna livre para trás'],
    frames: [
      f(
        [50, 14],
        [50, 24],
        [50, 54],
        [50, 26],
        [50, 26],
        [50, 40],
        [50, 40],
        [50, 54],
        [50, 54],
        [50, 72],
        [50, 72],
        [50, 92],
        [50, 92],
      ),
      f(
        [24, 44],
        [32, 46],
        [56, 56],
        [32, 46],
        [32, 46],
        [34, 60],
        [34, 60],
        [36, 74],
        [36, 74],
        [52, 74],
        [78, 50],
        [52, 92],
        [96, 44],
      ),
    ],
  },
  /* Sentado, puxando um elástico preso à frente. */
  'remada-elastico': {
    stepMs: 1200,
    props: [
      GROUND,
      { type: 'line', coords: [96, 40, 96, 92] },
      { type: 'line', coords: [30, 62, 60, 62] },
    ],
    caption: ['Braços estendidos', 'Puxe os cotovelos para trás'],
    frames: [
      f(
        [38, 22],
        [40, 32],
        [42, 62],
        [40, 34],
        [40, 34],
        [58, 42],
        [58, 42],
        [76, 46],
        [76, 46],
        [66, 64],
        [66, 64],
        [68, 92],
        [68, 92],
      ),
      f(
        [36, 22],
        [38, 32],
        [42, 62],
        [38, 34],
        [38, 34],
        [30, 46],
        [30, 46],
        [46, 48],
        [46, 48],
        [66, 64],
        [66, 64],
        [68, 92],
        [68, 92],
      ),
    ],
  },
  /* De quatro; braço e perna opostos estendem. */
  'bird-dog': {
    stepMs: 1500,
    props: [GROUND],
    caption: ['De quatro, costas neutras', 'Estenda braço e perna opostos'],
    frames: [
      f(
        [18, 44],
        [26, 50],
        [66, 52],
        [26, 50],
        [26, 50],
        [26, 70],
        [26, 70],
        [26, 92],
        [26, 92],
        [70, 72],
        [70, 72],
        [84, 92],
        [84, 92],
      ),
      f(
        [14, 42],
        [26, 50],
        [66, 52],
        [26, 50],
        [26, 50],
        [26, 70],
        [12, 42],
        [26, 92],
        [-4, 40],
        [70, 72],
        [84, 50],
        [84, 92],
        [100, 46],
      ),
    ],
  },
  /* Drible: joelhos flexionados, mão quica a bola. */
  drible: {
    stepMs: 500,
    loop: false,
    props: [GROUND, { type: 'circle', coords: [72, 84, 6], moving: true }],
    held: { joint: 'handR', radius: 6, offset: [0, 8] },
    caption: ['Mão em cima da bola', 'Empurre a bola para o chão com os dedos'],
    frames: [
      f(
        [46, 16],
        [46, 26],
        [48, 54],
        [46, 28],
        [46, 28],
        [40, 42],
        [62, 40],
        [40, 56],
        [70, 52],
        [42, 74],
        [58, 74],
        [38, 92],
        [62, 92],
      ),
      f(
        [46, 16],
        [46, 26],
        [48, 54],
        [46, 28],
        [46, 28],
        [40, 42],
        [64, 46],
        [40, 56],
        [72, 70],
        [42, 74],
        [58, 74],
        [38, 92],
        [62, 92],
      ),
    ],
  },
  /* Arremesso: agacha com a bola na testa, estende tudo. */
  arremesso: {
    stepMs: 1000,
    props: [GROUND],
    held: { joint: 'handR', radius: 6, offset: [2, -4] },
    caption: ['Joelhos dobrados, bola na frente da testa', 'Estenda pernas, braço e punho'],
    frames: [
      f(
        [50, 20],
        [50, 30],
        [50, 58],
        [50, 32],
        [50, 32],
        [60, 42],
        [62, 40],
        [56, 26],
        [60, 24],
        [44, 76],
        [58, 76],
        [42, 92],
        [60, 92],
      ),
      f(
        [50, 12],
        [50, 22],
        [50, 52],
        [50, 24],
        [50, 24],
        [60, 14],
        [62, 12],
        [62, 2],
        [66, 0],
        [46, 72],
        [56, 72],
        [44, 92],
        [58, 92],
      ),
    ],
  },
  /* Bandeja: passo, joelho sobe, braço solta a bola na tabela. */
  bandeja: {
    stepMs: 1200,
    props: [GROUND, { type: 'rect', coords: [84, 6, 12, 14] }],
    held: { joint: 'handR', radius: 5, offset: [2, -4] },
    caption: ['Passo com a bola nas mãos', 'Suba o joelho e solte a bola na tabela'],
    frames: [
      f(
        [40, 20],
        [40, 30],
        [42, 58],
        [40, 32],
        [40, 32],
        [52, 42],
        [52, 42],
        [60, 36],
        [60, 36],
        [34, 76],
        [54, 74],
        [28, 92],
        [62, 92],
      ),
      f(
        [50, 14],
        [50, 24],
        [50, 54],
        [50, 26],
        [50, 26],
        [64, 20],
        [66, 18],
        [74, 8],
        [78, 4],
        [66, 60],
        [50, 74],
        [60, 70],
        [50, 92],
      ),
    ],
  },
};
