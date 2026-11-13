import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, defer, of } from 'rxjs';
import { OmecoCase } from '../../models/concern';
import { AuditEvent, DemoUser } from '../../models/admin';
import { PageRequest, PageResponse, paginate } from '../../models/pagination';
import { ConcernRepository } from './concern.repository';
import { AdminWorkspaceService } from '../../core/services/admin-workspace.service';
import { assessRisk, BarangayRisk } from '../../core/config/risk';
export interface IncidentQuery extends PageRequest {
  municipality?: string;
  barangay?: string;
  category?: string;
  priority?: string;
  status?: string;
  from?: string;
  through?: string;
}
export interface Distribution {
  label: string;
  count: number;
}
export interface IncidentAnalytics {
  trends: { timestamp: string; count: number }[];
  categories: Distribution[];
  priorities: Distribution[];
  resolution: { active: number; resolved: number };
  barangays: ({ code: string } & BarangayRisk)[];
  restoration: { id: string; actualHours: number | null }[];
  forecast: { state: 'unavailable'; reason: string };
}
export abstract class WorkspaceRepository {
  abstract complaints(query: IncidentQuery): Observable<PageResponse<OmecoCase>>;
  abstract users(query: PageRequest): Observable<PageResponse<DemoUser>>;
  abstract assignments(query: IncidentQuery, crew: string): Observable<PageResponse<OmecoCase>>;
  abstract dispatchHistory(query: PageRequest): Observable<PageResponse<AuditEvent>>;
  abstract audit(query: PageRequest): Observable<PageResponse<AuditEvent>>;
  abstract reports(query: IncidentQuery): Observable<PageResponse<OmecoCase>>;
  abstract analytics(
    query: Omit<IncidentQuery, 'page' | 'pageSize'>,
  ): Observable<IncidentAnalytics>;
  abstract gis(
    query: Omit<IncidentQuery, 'page' | 'pageSize'>,
  ): Observable<IncidentAnalytics['barangays']>;
}
export function queryIncidents(items: OmecoCase[], query: IncidentQuery): OmecoCase[] {
  let rows = items.filter(
    (x) =>
      (!query.search ||
        (x.id + ' ' + x.member + ' ' + x.description + ' ' + x.location)
          .toLowerCase()
          .includes(query.search.toLowerCase())) &&
      (!query.municipality || x.municipality === query.municipality) &&
      (!query.barangay || x.barangayCode === query.barangay) &&
      (!query.category || x.category === query.category) &&
      (!query.priority || x.priority === query.priority) &&
      (!query.status || x.status === query.status) &&
      (!query.from || (x.reportedAt || '').slice(0, 10) >= query.from) &&
      (!query.through || (x.reportedAt || '').slice(0, 10) <= query.through),
  );
  const field = query.sortBy as keyof OmecoCase;
  if (field && ['id', 'reportedAt', 'households', 'priority', 'status'].includes(field))
    rows = [...rows].sort((a, b) => {
      const av = a[field],
        bv = b[field];
      const order =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av || '').localeCompare(String(bv || ''));
      return order * (query.sortDirection === 'desc' ? -1 : 1);
    });
  return rows;
}
@Injectable()
export class MockWorkspaceRepository extends WorkspaceRepository {
  private records = inject(ConcernRepository);
  private store = inject(AdminWorkspaceService);
  complaints(q: IncidentQuery) {
    return defer(() => of(paginate(queryIncidents(this.records.concerns(), q), q)));
  }
  reports(q: IncidentQuery) {
    return this.complaints(q);
  }
  assignments(q: IncidentQuery, crew: string) {
    return defer(() =>
      of(
        paginate(
          queryIncidents(
            this.records.concerns().filter((x) => x.assignedCrew === crew),
            q,
          ),
          q,
        ),
      ),
    );
  }
  users(q: PageRequest) {
    return defer(() =>
      of(
        paginate(
          this.store
            .users()
            .filter(
              (x) =>
                !q.search ||
                (x.name + ' ' + x.email + ' ' + x.role)
                  .toLowerCase()
                  .includes(q.search.toLowerCase()),
            ),
          q,
        ),
      ),
    );
  }
  audit(q: PageRequest) {
    return defer(() =>
      of(
        paginate(
          this.records
            .audit()
            .filter(
              (x) =>
                !q.search ||
                (x.action + ' ' + x.actor + ' ' + x.recordId)
                  .toLowerCase()
                  .includes(q.search.toLowerCase()),
            ),
          q,
        ),
      ),
    );
  }
  dispatchHistory(q: PageRequest) {
    return defer(() =>
      of(
        paginate(
          this.records.audit().filter((x) => /dispatch|assignment/i.test(x.action)),
          q,
        ),
      ),
    );
  }
  analytics(q: Omit<IncidentQuery, 'page' | 'pageSize'>) {
    return defer(() => {
      const rows = queryIncidents(this.records.concerns(), { ...q, page: 1, pageSize: 10 });
      const distribution = (key: 'category' | 'priority') =>
        [...new Set(rows.map((x) => x[key]))].map((label) => ({
          label,
          count: rows.filter((x) => x[key] === label).length,
        }));
      const resolved = rows.filter((x) => /resolved|restored|completed/i.test(x.status)).length;
      return of({
        trends: [...new Set(rows.map((x) => (x.reportedAt || '').slice(0, 10)))]
          .sort()
          .map((timestamp) => ({
            timestamp,
            count: rows.filter((x) => x.reportedAt?.startsWith(timestamp)).length,
          })),
        categories: distribution('category'),
        priorities: distribution('priority'),
        resolution: { active: rows.length - resolved, resolved },
        barangays: [
          ...new Set(rows.map((x) => x.barangayCode).filter((x): x is string => !!x)),
        ].map((code) => ({ code, ...assessRisk(rows.filter((x) => x.barangayCode === code)) })),
        restoration: rows.map((x) => ({ id: x.id, actualHours: x.actualRepairHours ?? null })),
        forecast: {
          state: 'unavailable' as const,
          reason: 'No trained forecasting service is configured.',
        },
      });
    });
  }
  gis(q: Omit<IncidentQuery, 'page' | 'pageSize'>) {
    return defer(() =>
      of(
        [
          ...new Set(
            this.records
              .concerns()
              .map((x) => x.barangayCode)
              .filter((x): x is string => !!x),
          ),
        ].map((code) => ({
          code,
          ...assessRisk(
            queryIncidents(this.records.concerns(), { ...q, page: 1, pageSize: 10 }).filter(
              (x) => x.barangayCode === code,
            ),
          ),
        })),
      ),
    );
  }
}
@Injectable()
export class HttpWorkspaceRepository extends WorkspaceRepository {
  private http = inject(HttpClient);
  private get<T>(path: string, query: object): Observable<T> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query))
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    return this.http.get<T>('/api/' + path, { params });
  }
  complaints(q: IncidentQuery) {
    return this.get<PageResponse<OmecoCase>>('complaints', q);
  }
  reports(q: IncidentQuery) {
    return this.get<PageResponse<OmecoCase>>('reports/incidents', q);
  }
  users(q: PageRequest) {
    return this.get<PageResponse<DemoUser>>('users', q);
  }
  assignments(q: IncidentQuery, crew: string) {
    return this.get<PageResponse<OmecoCase>>('assignments', { ...q, crew });
  }
  dispatchHistory(q: PageRequest) {
    return this.get<PageResponse<AuditEvent>>('dispatch/history', q);
  }
  audit(q: PageRequest) {
    return this.get<PageResponse<AuditEvent>>('audit-events', q);
  }
  analytics(q: Omit<IncidentQuery, 'page' | 'pageSize'>) {
    return this.get<IncidentAnalytics>('analytics/summary', q);
  }
  gis(q: Omit<IncidentQuery, 'page' | 'pageSize'>) {
    return this.get<IncidentAnalytics['barangays']>('gis/barangay-summaries', q);
  }
}
