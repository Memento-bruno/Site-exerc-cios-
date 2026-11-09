import {
  formatDuration,
  formatPace,
  kmhToPace,
  paceSecondsToKmh,
  parsePace,
  secondsForDistance,
} from './units';

describe('km/h ↔ min/km', () => {
  it('converte velocidade em ritmo', () => {
    expect(kmhToPace(10.4)).toBe('5:46');
    expect(kmhToPace(10)).toBe('6:00');
    expect(kmhToPace(10.6)).toBe('5:40');
    expect(kmhToPace(12)).toBe('5:00');
    expect(kmhToPace(0)).toBe('—');
  });

  it('converte ritmo em velocidade', () => {
    expect(paceSecondsToKmh(360)).toBeCloseTo(10, 5);
    expect(paceSecondsToKmh(parsePace('5:45')!)).toBeCloseTo(10.43, 2);
    expect(parsePace('5:75')).toBeNull();
    expect(parsePace('abc')).toBeNull();
  });

  it('tempo para uma distância', () => {
    expect(secondsForDistance(400, 10.4)).toBe(138);
    expect(secondsForDistance(800, 10)).toBe(288);
    expect(secondsForDistance(1000, 10.2)).toBe(353);
  });

  it('formata durações', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(138)).toBe('2:18');
    expect(formatDuration(3600 + 65)).toBe('1:01:05');
    expect(formatPace(345)).toBe('5:45');
  });
});

describe('parseDuration', () => {
  it('aceita mm:ss, h:mm:ss e minutos', async () => {
    const { parseDuration } = await import('./units');
    expect(parseDuration('29:45')).toBe(1785);
    expect(parseDuration('1:02:03')).toBe(3723);
    expect(parseDuration('30')).toBe(1800);
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('ab')).toBeNull();
  });
});
