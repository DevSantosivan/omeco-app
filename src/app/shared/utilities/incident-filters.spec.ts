import { INCIDENT_SEED } from '../../data/mock/admin-seed';
import { filterIncidents, EMPTY_FILTER } from './incident-filters';
describe('shared incident filters', () => {
  it('uses inclusive UTC date boundaries and combines geography and priority filters', () => {
    const example = INCIDENT_SEED[0];
    const date = example.reportedAt!.slice(0, 10);
    const result = filterIncidents(INCIDENT_SEED, {
      ...EMPTY_FILTER,
      dateFrom: date,
      dateTo: date,
      municipality: example.municipality!,
      barangay: example.barangayCode!,
      priority: example.priority,
    });
    expect(result.some((x) => x.id === example.id)).toBe(true);
    expect(
      result.every(
        (x) =>
          x.reportedAt?.startsWith(date) &&
          x.barangayCode === example.barangayCode &&
          x.priority === example.priority,
      ),
    ).toBe(true);
  });
  it('returns no records for an impossible municipality rather than changing the source', () => {
    expect(
      filterIncidents(INCIDENT_SEED, { ...EMPTY_FILTER, municipality: 'Not in dataset' }),
    ).toHaveLength(0);
    expect(INCIDENT_SEED).toHaveLength(96);
  });
});
