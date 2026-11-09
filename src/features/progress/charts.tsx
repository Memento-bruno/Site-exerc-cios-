import type { ReactNode } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/lib/useTheme';

export function ChartCard({
  title,
  subtitle,
  children,
  action,
  empty,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  empty?: string | false;
}) {
  return (
    <section className="card p-4" aria-label={title}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {empty ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800/60">
          {empty}
        </p>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </section>
  );
}

export interface LinePoint {
  x: string;
  y: number | null;
  label?: string;
}

/** Linha única com linhas de referência (meta). */
export function SingleLine({
  data,
  color = '#f97316',
  unit = '',
  refs = [],
  domain,
  formatY = (v: number) => String(v),
  height = 220,
}: {
  data: LinePoint[];
  color?: string;
  unit?: string;
  refs?: { y: number; label: string; color?: string }[];
  domain?: [number | 'auto', number | 'auto'];
  formatY?: (v: number) => string;
  height?: number;
}) {
  const dark = useTheme() === 'dark';
  const ink = dark ? '#c3c2b7' : '#52514e';
  const grid = dark ? '#2b2b2a' : '#e8e8e6';
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="x"
            tick={{ fill: ink, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: grid }}
            minTickGap={24}
          />
          <YAxis
            domain={domain}
            tick={{ fill: ink, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatY}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: dark ? '#1a1a19' : '#fff',
              border: `1px solid ${grid}`,
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: ink }}
            formatter={(v) => [`${formatY(Number(v))}${unit}`, '']}
          />
          {refs.map((r) => (
            <ReferenceLine
              key={r.label}
              y={r.y}
              stroke={r.color ?? ink}
              strokeDasharray="4 4"
              label={{ value: r.label, position: 'insideTopRight', fill: ink, fontSize: 10 }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
