import { OmecoCase } from '../../models/concern';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical' | 'No data';
export const RISK_CONFIG: readonly { level: RiskLevel; color: string; minimum: number }[] = [
  { level: 'No data', color: '#CBD5E1', minimum: -1 },
  { level: 'Low', color: '#16A34A', minimum: 0 },
  { level: 'Moderate', color: '#EAB308', minimum: 25 },
  { level: 'High', color: '#F97316', minimum: 50 },
  { level: 'Critical', color: '#DC2626', minimum: 75 },
];
export interface BarangayRisk {
  level: RiskLevel;
  color: string;
  score: number | null;
  total: number;
  active: number;
  households: number;
  recent: string;
}
/** Illustrative score; not calibrated, area/population normalized or an operational risk model. */
export function assessRisk(records: readonly OmecoCase[]): BarangayRisk {
  const total = records.length;
  const active = records.filter((x) => !/resolved|restored|completed/i.test(x.status)).length;
  const households = records.reduce((n, x) => n + x.households, 0);
  const severity = records.reduce(
    (n, x) => n + (x.priority === 'Critical' ? 3 : x.priority === 'Urgent' ? 2 : 1),
    0,
  );
  const score =
    total < 2
      ? null
      : Math.min(
          100,
          total * 4 +
            Math.max(0, total - 1) * 3 +
            severity * 2 +
            active * 3 +
            Math.min(20, households / 10),
        );
  const config =
    score === null
      ? RISK_CONFIG[0]
      : [...RISK_CONFIG].reverse().find((x) => x.minimum >= 0 && score >= x.minimum)!;
  const recent = [...records].sort((a, b) =>
    (b.reportedAt || '').localeCompare(a.reportedAt || ''),
  )[0];
  return {
    level: config.level,
    color: config.color,
    score: score === null ? null : Math.round(score),
    total,
    active,
    households,
    recent: recent ? recent.id + ' · ' + (recent.reportedAt || recent.time) : 'No reports',
  };
}
