import {
  addDays,
  dateOfPlanDay,
  daysBetween,
  effectiveStartDate,
  fromISODate,
  mondayOf,
  nextMonday,
  planPosition,
  toISODate,
} from './dates';

const d = (s: string) => fromISODate(s);

describe('datas do plano', () => {
  it('converte ISO ida e volta no fuso local', () => {
    expect(toISODate(d('2026-11-16'))).toBe('2026-11-16');
    expect(d('2026-11-16').getDay()).toBe(1);
  });

  it('acha a próxima segunda-feira', () => {
    expect(toISODate(nextMonday(d('2026-11-09')))).toBe('2026-11-16'); // segunda → próxima
    expect(toISODate(nextMonday(d('2026-11-11')))).toBe('2026-11-16'); // quarta
    expect(toISODate(nextMonday(d('2026-11-15')))).toBe('2026-11-16'); // domingo
  });

  it('acha a segunda da semana', () => {
    expect(toISODate(mondayOf(d('2026-11-15')))).toBe('2026-11-09'); // domingo pertence à semana anterior
    expect(toISODate(mondayOf(d('2026-11-11')))).toBe('2026-11-09');
  });

  it('calcula semana e dia a partir da data de início', () => {
    const start = d('2026-11-16');
    expect(planPosition(start, d('2026-11-15'))).toMatchObject({ week: 0, status: 'antes' });
    expect(planPosition(start, d('2026-11-16'))).toMatchObject({
      week: 1,
      weekday: 1,
      dayIndex: 1,
    });
    expect(planPosition(start, d('2026-11-22'))).toMatchObject({
      week: 1,
      weekday: 0,
      dayIndex: 7,
    });
    expect(planPosition(start, d('2026-11-23'))).toMatchObject({ week: 2, weekday: 1 });
    expect(planPosition(start, addDays(start, 7 * 11 + 5))).toMatchObject({ week: 12, weekday: 6 });
    expect(planPosition(start, addDays(start, 7 * 23 + 6))).toMatchObject({
      week: 24,
      status: 'em-andamento',
    });
    expect(planPosition(start, addDays(start, 7 * 24))).toMatchObject({
      week: 25,
      status: 'concluido',
    });
  });

  it('repetir uma semana empurra a data efetiva 7 dias', () => {
    const start = d('2026-11-16');
    const repeats = [{ week: 3, decidedAt: '2026-12-06' }];
    expect(toISODate(effectiveStartDate(start, repeats))).toBe('2026-11-23');
    // Sem repetição, 2026-12-07 seria semana 4; com uma repetição, volta a ser semana 3.
    expect(planPosition(start, d('2026-12-07')).week).toBe(4);
    expect(planPosition(start, d('2026-12-07'), repeats).week).toBe(3);
    expect(
      planPosition(start, d('2026-12-07'), [...repeats, { week: 3, decidedAt: '2026-12-13' }]).week,
    ).toBe(2);
  });

  it('data de um dia do plano', () => {
    const start = d('2026-11-16');
    expect(toISODate(dateOfPlanDay(start, 1, 1))).toBe('2026-11-16');
    expect(toISODate(dateOfPlanDay(start, 1, 0))).toBe('2026-11-22');
    expect(toISODate(dateOfPlanDay(start, 2, 5))).toBe('2026-11-27');
    expect(daysBetween(start, dateOfPlanDay(start, 24, 6))).toBe(23 * 7 + 5);
  });
});
