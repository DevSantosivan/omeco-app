import { Injectable, computed, signal, inject } from '@angular/core';
import { AuthPort } from '../../models/auth';
import { Announcement } from '../../models/announcement';

const RECORDS: Announcement[] = [
  {
    id: 'ANN-2026-1107-01',
    type: 'Interruption',
    title: 'Scheduled power interruption',
    summary: 'Line maintenance will affect selected San Jose barangays.',
    description:
      'OMECO crews will perform preventive line maintenance. Please unplug sensitive appliances before the scheduled interruption and treat all lines as energized.',
    publishedAt: 'Nov 7, 2026 · 8:15 AM',
    affectedArea: 'Poblacion and Labangan, San Jose',
    schedule: 'Nov 8, 2026 · 8:00 AM–12:00 PM',
    status: 'Scheduled',
    lastUpdated: 'Nov 7, 2026 · 10:30 AM',
    icon: 'calendar',
  },
  {
    id: 'ANN-2026-1107-02',
    type: 'Outage advisory',
    title: 'Emergency outage advisory',
    summary: 'Crews are responding to an unplanned outage in parts of Mamburao.',
    description:
      'An unplanned service interruption is under assessment. Field crews have been dispatched and updates will be posted when verified.',
    publishedAt: 'Nov 7, 2026 · 9:40 AM',
    affectedArea: 'Pag-asa, Mamburao',
    status: 'Active',
    lastUpdated: 'Nov 7, 2026 · 10:05 AM',
    icon: 'error',
  },
  {
    id: 'ANN-2026-1106-01',
    type: 'Restoration',
    title: 'Service restored in San Vicente',
    summary: 'Power service has been restored after line repairs.',
    description:
      'Repair work was completed and service restoration was confirmed. If your household remains without power, please submit a concern.',
    publishedAt: 'Nov 6, 2026 · 6:20 PM',
    affectedArea: 'San Vicente, Sablayan',
    status: 'Restored',
    icon: 'check-circle',
  },
  {
    id: 'ANN-2026-1105-01',
    type: 'Maintenance',
    title: 'Vegetation clearing activity',
    summary: 'Routine clearing is scheduled near distribution lines.',
    description:
      'Vegetation management teams will clear branches near distribution facilities to reduce service interruptions.',
    publishedAt: 'Nov 5, 2026 · 2:00 PM',
    affectedArea: 'Selected areas of Calintaan',
    schedule: 'Nov 9–10, 2026 · 7:00 AM–4:00 PM',
    status: 'Scheduled',
    icon: 'wrench',
  },
  {
    id: 'ANN-2026-1104-01',
    type: 'General',
    title: 'Use your reference number for faster support',
    summary: 'Keep your concern reference number when contacting member services.',
    description:
      'Your reference number helps member services find your concern and its verified updates quickly.',
    publishedAt: 'Nov 4, 2026 · 11:00 AM',
    status: 'Published',
    icon: 'info-circle',
  },
];

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  readonly records = signal(RECORDS);
  private readonly auth = inject(AuthPort);
  private readonly readState = signal<Record<string, string[]>>({});
  private get storageKey(): string {
    return 'omeco-announcement-read:' + (this.auth.session()?.email || 'guest');
  }
  private readonly readIds = computed(() => this.readState()[this.storageKey] || this.restore());
  readonly unreadCount = computed(
    () => this.records().filter((x) => !this.readIds().includes(x.id)).length,
  );
  isRead(id: string): boolean {
    return this.readIds().includes(id);
  }
  markRead(id: string): void {
    if (this.isRead(id)) return;
    const next = [...this.readIds(), id];
    this.readState.update((state) => ({ ...state, [this.storageKey]: next }));
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(next));
    } catch {
      /* Demo state remains in memory. */
    }
  }
  byId(id: string): Announcement | undefined {
    return this.records().find((x) => x.id === id);
  }
  private restore(): string[] {
    try {
      const value = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }
}
