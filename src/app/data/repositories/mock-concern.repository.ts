import { Injectable, computed, signal } from '@angular/core';
import { ConcernRepository } from './concern.repository';
import { OmecoCase } from '../../models/concern';
import { AuditEvent } from '../../models/admin';
import { INCIDENT_SEED, AUDIT_SEED, CREW_SEED } from '../mock/admin-seed';
import { BARANGAYS } from '../mock/geography';

@Injectable()
export class MockConcernRepository extends ConcernRepository {
  private readonly records = signal<OmecoCase[]>(structuredClone(INCIDENT_SEED));
  readonly concerns = this.records.asReadonly();
  readonly loading = signal(false).asReadonly();
  readonly crews = computed(() =>
    CREW_SEED.map((crew) => ({
      ...crew,
      available: !this.concerns().some(
        (item) =>
          item.assignedCrew === crew.name && !/resolved|restored|complete/i.test(item.status),
      ),
    })),
  );
  readonly audit = signal<AuditEvent[]>(structuredClone(AUDIT_SEED));
  readonly error = signal('');
  readonly activity = computed(() => {
    const latest = Math.max(
      ...this.concerns()
        .map((x) => Date.parse(x.reportedAt || ''))
        .filter(Number.isFinite),
    );
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(latest - (6 - i) * 86400000).toISOString().slice(0, 10);
      return {
        label: day.slice(5),
        value: this.concerns().filter((x) => x.reportedAt?.startsWith(day)).length,
        tone: 'blue' as const,
      };
    });
  });
  constructor() {
    super();
    try {
      const saved = sessionStorage.getItem('omeco-records-v3');
      if (saved) {
        const state = JSON.parse(saved) as { records: OmecoCase[]; audit: AuditEvent[] };
        if (
          !Array.isArray(state.records) ||
          !Array.isArray(state.audit) ||
          !state.records.every((x) => x.id && x.category && typeof x.households === 'number')
        )
          throw Error('Invalid demo session');
        this.records.set(
          state.records.map((record) => {
            const seed = INCIDENT_SEED.find((item) => item.id === record.id);
            return seed
              ? {
                  ...record,
                  municipality: seed.municipality,
                  barangay: seed.barangay,
                  barangayCode: seed.barangayCode,
                  coordinates: seed.coordinates,
                  location: seed.location,
                  member: seed.member,
                  reportedAt: seed.reportedAt,
                  time: seed.time,
                  resolvedAt: seed.resolvedAt,
                  actualRepairHours: seed.actualRepairHours,
                }
              : record;
          }),
        );
        this.audit.set(
          state.audit.map((event) =>
            event.seeded ? AUDIT_SEED.find((seed) => seed.id === event.id) || event : event,
          ),
        );
      }
    } catch {
      this.error.set(
        'The stored demo data could not be read. Restore the deterministic sample to continue.',
      );
    }
  }
  add(record: OmecoCase): void {
    const normalize = (value: string) => value.toLowerCase().replace(' (capital)', '').trim();
    const place = BARANGAYS.find(
      (item) =>
        normalize(item.municipality) === normalize(record.municipality || '') &&
        normalize(item.barangay) === normalize(record.barangay || ''),
    );
    this.records.update((items) => [
      {
        ...record,
        ...(place
          ? { municipality: place.municipality, barangay: place.barangay, barangayCode: place.code }
          : {}),
        reportedAt: record.reportedAt || new Date().toISOString(),
        simulated: true,
      },
      ...items,
    ]);
    this.logEvent(
      'Complaint submission',
      record.id,
      record.category + ' submitted through ' + (record.channel || 'demo intake'),
    );
  }
  update(id: string, changes: Partial<OmecoCase>): void {
    if (!this.findById(id)) return;
    this.records.update((items) => items.map((x) => (x.id === id ? { ...x, ...changes } : x)));
    const action = changes.assignedCrew
      ? 'Crew assignment update'
      : changes.priority
        ? 'Priority override'
        : changes.classificationReviewed
          ? 'Classification review'
          : changes.repairNotes !== undefined
            ? 'Repair progress'
            : 'Concern update';
    this.logEvent(action, id, JSON.stringify(changes));
  }
  findById(id: string): OmecoCase | undefined {
    return this.records().find((x) => x.id === id);
  }
  logEvent(action: string, recordId: string, detail: string, actor = 'Demo session'): void {
    this.audit.update((events) =>
      [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          actor,
          action,
          recordId,
          detail,
          seeded: false,
        },
        ...events,
      ].slice(0, 500),
    );
    this.persist();
  }
  recover(): void {
    this.records.set(structuredClone(INCIDENT_SEED));
    this.audit.set(structuredClone(AUDIT_SEED));
    this.error.set('');
    this.persist();
  }
  private persist(): void {
    try {
      sessionStorage.setItem(
        'omeco-records-v3',
        JSON.stringify({ records: this.records(), audit: this.audit() }),
      );
    } catch {
      /* In-memory demo continues when browser storage is unavailable. */
    }
  }
}
