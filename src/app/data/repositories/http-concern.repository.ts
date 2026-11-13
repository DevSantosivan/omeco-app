import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConcernRepository } from './concern.repository';
import { OmecoCase } from '../../models/concern';
import { AuditEvent, Crew } from '../../models/admin';
import { PageResponse } from '../../models/pagination';
import { tap } from 'rxjs';
/** Transitional state adapter. Only a bounded page is cached; aggregate consumers use WorkspaceRepository. */
@Injectable()
export class HttpConcernRepository extends ConcernRepository {
  override create(record: OmecoCase) {
    return this.http
      .post<OmecoCase>('/api/complaints', record)
      .pipe(tap((saved) => this.concerns.update((rows) => [saved, ...rows].slice(0, 100))));
  }
  private readonly http = inject(HttpClient);
  readonly concerns = signal<OmecoCase[]>([]);
  readonly audit = signal<AuditEvent[]>([]);
  readonly crews = signal<Crew[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly activity = computed(() => []);
  constructor() {
    super();
    this.recover();
  }
  recover(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<PageResponse<OmecoCase>>('/api/complaints?page=1&pageSize=10').subscribe({
      next: (response) => {
        this.concerns.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The configured API is unavailable. No sample data was substituted.');
        this.loading.set(false);
      },
    });
    this.http.get<Crew[]>('/api/crews').subscribe({
      next: (rows) => this.crews.set(rows),
      error: () => this.error.set('Crew API unavailable. No sample crew data was substituted.'),
    });
  }
  findById(id: string): OmecoCase | undefined {
    return this.concerns().find((x) => x.id === id);
  }
  add(record: OmecoCase): void {
    this.http.post<OmecoCase>('/api/complaints', record).subscribe({
      next: (saved) => this.concerns.update((rows) => [saved, ...rows].slice(0, 100)),
      error: () => this.error.set('Submission failed. The record has not been saved.'),
    });
  }
  update(id: string, changes: Partial<OmecoCase>): void {
    this.http.patch<OmecoCase>('/api/complaints/' + encodeURIComponent(id), changes).subscribe({
      next: (saved) => this.concerns.update((rows) => rows.map((x) => (x.id === id ? saved : x))),
      error: () => this.error.set('Update failed. No local success was recorded.'),
    });
  }
  logEvent(): void {
    /* Server must generate authenticated audit events for HTTP mutations. */
  }
}
