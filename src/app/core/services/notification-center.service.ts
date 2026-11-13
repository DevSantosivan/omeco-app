import { Injectable, signal, computed, inject } from '@angular/core';
import { ConcernRepository } from '../../data/repositories/concern.repository';
import { DisplayPreferencesService } from './display-preferences.service';
import { AuthPort } from '../../models/auth';
import { AnnouncementService } from './announcement.service';
export interface AppNotice {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  kind: 'info' | 'success' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class NotificationCenterService {
  private readonly repository = inject(ConcernRepository);
  private readonly preferences = inject(DisplayPreferencesService);
  private readonly auth = inject(AuthPort);
  private readonly announcements = inject(AnnouncementService);
  private readonly readIds = signal(new Set<string>());
  readonly notices = computed<AppNotice[]>(() => {
    const session = this.auth.session();
    const activity = this.repository
      .audit()
      .filter((event) => {
        if (session?.role === 'admin') return true;
        const incident = this.repository.findById(event.recordId);
        return session?.role === 'member'
          ? incident?.member === session.name
          : session?.role === 'field-worker' && incident?.assignedCrew === 'Line Crew 01';
      })
      .filter(
        (x) =>
          this.preferences.saved().dispatchAlerts || !x.action.toLowerCase().includes('dispatch'),
      )
      .slice(0, 10)
      .map<AppNotice>((x) => ({
        id: x.id,
        title: x.action,
        detail: x.recordId + ' · ' + (x.seeded ? 'Seeded simulation' : x.actor),
        time: x.timestamp,
        read: this.readIds().has(x.id),
        kind: 'info',
      }));
    const advisories: AppNotice[] =
      session?.role === 'member'
        ? this.announcements.records().map((x) => ({
            id: 'announcement:' + x.id,
            title: x.title,
            detail: x.type + ' · ' + x.summary,
            time: x.publishedAt,
            read: this.announcements.isRead(x.id),
            kind:
              x.type === 'Restoration'
                ? 'success'
                : x.type === 'Outage advisory'
                  ? 'warning'
                  : 'info',
          }))
        : [];
    return [...advisories, ...activity].slice(0, 10);
  });
  readonly unreadCount = computed(() => this.notices().filter((x) => !x.read).length);
  markAllRead(): void {
    this.readIds.set(new Set(this.notices().map((x) => x.id)));
    if (this.auth.session()?.role === 'member')
      for (const item of this.announcements.records()) this.announcements.markRead(item.id);
  }
}
