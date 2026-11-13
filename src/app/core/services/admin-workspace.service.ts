import { Injectable, computed, inject, signal } from '@angular/core';
import { ConcernRepository } from '../../data/repositories/concern.repository';
import { AuthPort } from '../../models/auth';
import { USER_SEED, MODEL_SEED } from '../../data/mock/admin-seed';
import { BARANGAYS } from '../../data/mock/geography';
import {
  DemoUser,
  HotspotRow,
  ReviewEntry,
  RestorationRow,
  TimeObservation,
} from '../../models/admin';
import { OmecoCase } from '../../models/concern';

@Injectable({ providedIn: 'root' })
export class AdminWorkspaceService {
  readonly repository = inject(ConcernRepository);
  readonly auth = inject(AuthPort);
  readonly incidents = this.repository.concerns;
  readonly error = this.repository.error;
  readonly loading = signal(true);
  readonly users = signal<DemoUser[]>(this.restoreUsers());
  readonly models = MODEL_SEED;
  readonly geography = BARANGAYS;
  readonly municipalities = [...new Set(BARANGAYS.map((x) => x.municipality))];
  readonly categories = computed(() => [...new Set(this.incidents().map((x) => x.category))]);
  readonly histories = computed<ReviewEntry[]>(() =>
    this.repository
      .audit()
      .filter((x) => x.action === 'Classification review' || x.action === 'Priority override')
      .map((x) => ({
        id: x.id,
        timestamp: x.timestamp,
        incidentId: x.recordId,
        kind: x.action === 'Classification review' ? 'Classification' : 'Priority',
        before: 'See recorded change',
        after: x.detail,
        actor: x.actor,
        note: x.seeded ? 'Seeded simulation' : 'Demo action',
      })),
  );
  readonly hotspots = computed<HotspotRow[]>(() => this.groupHotspots(this.incidents()));
  readonly restorations = computed<RestorationRow[]>(() =>
    this.incidents().map((x) => this.estimate(x)),
  );
  constructor() {
    setTimeout(() => this.loading.set(false), 120);
  }
  retry(): void {
    this.repository.recover();
  }
  actor(): string {
    return this.auth.session()?.name || 'Demo dispatcher';
  }
  reviewCategory(id: string, category: string, note: string): void {
    const item = this.repository.findById(id);
    if (!item || !category) return;
    this.repository.update(id, { category, classificationReviewed: true });
    this.repository.logEvent(
      'Classification review',
      id,
      `Category: ${item.category} → ${category}. ${note}`,
      this.actor(),
    );
  }
  reviewPriority(id: string, priority: OmecoCase['priority'], note: string): void {
    const item = this.repository.findById(id);
    if (!item) return;
    this.repository.update(id, { priority, priorityReviewed: true });
    this.repository.logEvent(
      'Priority override',
      id,
      `Priority: ${item.priority} → ${priority}. ${note}`,
      this.actor(),
    );
  }
  confidence(item: OmecoCase): number {
    return 70 + ([...item.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 26);
  }
  score(item: OmecoCase): number {
    return Math.min(
      99,
      (item.priority === 'Critical' ? 65 : item.priority === 'Urgent' ? 38 : 12) +
        Math.round(item.households / 4),
    );
  }
  groupHotspots(items: OmecoCase[]): HotspotRow[] {
    const rows = new Map<string, HotspotRow>();
    for (const x of items) {
      if (!x.barangayCode) continue;
      const row = rows.get(x.barangayCode) || {
        code: x.barangayCode,
        barangay: x.barangay || x.location,
        municipality: x.municipality || 'Unspecified',
        incidents: 0,
        households: 0,
        critical: 0,
        recurrence: 0,
      };
      row.incidents++;
      row.households += x.households;
      row.critical += x.priority === 'Critical' ? 1 : 0;
      row.recurrence = Math.max(0, row.incidents - 1);
      rows.set(row.code, row);
    }
    return [...rows.values()].sort((a, b) => b.incidents - a.incidents);
  }
  observations(items: OmecoCase[], period: 'day' | 'week' | 'month' = 'day'): TimeObservation[] {
    const rows = new Map<string, TimeObservation>();
    for (const x of items) {
      if (!x.reportedAt) continue;
      const d = new Date(x.reportedAt);
      if (period === 'week') d.setUTCDate(d.getUTCDate() - d.getUTCDay());
      const key = d.toISOString().slice(0, period === 'month' ? 7 : 10);
      const row = rows.get(key) || { date: key, count: 0, households: 0 };
      row.count++;
      row.households += x.households;
      rows.set(key, row);
    }
    return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
  estimate(item: OmecoCase): RestorationRow {
    const factors = [
      {
        label: 'Incident type',
        hours: item.category.includes('Transformer') ? 4 : item.category.includes('pole') ? 5 : 1.5,
      },
      {
        label: 'Priority / severity',
        hours: item.priority === 'Critical' ? 2 : item.priority === 'Urgent' ? 1 : 0.5,
      },
      { label: 'Household impact', hours: Math.round((item.households / 30) * 10) / 10 },
      { label: 'Crew readiness', hours: item.assignedCrew?.length ? 0.25 : 1.5 },
    ];
    return {
      incidentId: item.id,
      estimatedHours: Math.round(factors.reduce((n, x) => n + x.hours, 0) * 10) / 10,
      actualHours: item.actualRepairHours ?? null,
      timestamp: item.reportedAt || '',
      factors,
    };
  }
  updateUser(user: DemoUser): void {
    this.users.update((items) => items.map((x) => (x.id === user.id ? { ...user } : x)));
    try {
      sessionStorage.setItem('omeco-users-v1', JSON.stringify(this.users()));
    } catch {
      /* Keep in memory. */
    }
    this.repository.logEvent(
      'User account update',
      user.id,
      `${user.name}: ${user.active ? 'Active' : 'Disabled'}, role ${user.role}`,
      this.actor(),
    );
  }
  private restoreUsers(): DemoUser[] {
    try {
      const data = JSON.parse(sessionStorage.getItem('omeco-users-v1') || 'null');
      return Array.isArray(data) && data.every((x: DemoUser) => x.id && x.email)
        ? data
        : structuredClone(USER_SEED);
    } catch {
      return structuredClone(USER_SEED);
    }
  }
}
