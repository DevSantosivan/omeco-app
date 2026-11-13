import { assessRisk, RISK_CONFIG } from './risk';
import { INCIDENT_SEED } from '../../data/mock/admin-seed';
describe('Simulated geographic risk', () => {
  it('shows insufficient evidence as No data instead of copying complaint priority', () => {
    expect(assessRisk([]).level).toBe('No data');
    expect(assessRisk([{ ...INCIDENT_SEED[0], priority: 'Critical' }]).score).toBeNull();
  });
  it('uses deterministic aggregate factors and the exact shared legend color', () => {
    const rows = INCIDENT_SEED.slice(0, 4);
    const first = assessRisk(rows);
    expect(first).toEqual(assessRisk([...rows].reverse()));
    expect(first.color).toBe(RISK_CONFIG.find((x) => x.level === first.level)?.color);
    const restored = rows.map((x) => ({ ...x, status: 'Completed' }));
    expect(assessRisk(restored).score!).toBeLessThanOrEqual(first.score!);
    expect(assessRisk(restored).active).toBe(0);
  });
});
