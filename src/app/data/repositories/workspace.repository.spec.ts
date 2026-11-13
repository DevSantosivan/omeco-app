import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpWorkspaceRepository, queryIncidents } from './workspace.repository';
import { INCIDENT_SEED } from '../mock/admin-seed';
describe('API-ready workspace contract', () => {
  it('combines filters before paging and sorts numeric fields numerically', () => {
    const rows = queryIncidents(INCIDENT_SEED, {
      page: 1,
      pageSize: 10,
      priority: 'Critical',
      sortBy: 'households',
      sortDirection: 'desc',
    });
    expect(rows.every((x) => x.priority === 'Critical')).toBe(true);
    expect(rows[0].households).toBeGreaterThanOrEqual(rows.at(-1)!.households);
  });
  it('serializes a bounded request and propagates API errors without a mock fallback', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HttpWorkspaceRepository],
    });
    const repository = TestBed.inject(HttpWorkspaceRepository),
      http = TestBed.inject(HttpTestingController);
    let failed = false;
    repository
      .complaints({ page: 2, pageSize: 25, search: 'line', priority: 'Critical' })
      .subscribe({
        next: () => {
          throw Error('Unexpected fallback');
        },
        error: () => (failed = true),
      });
    const request = http.expectOne((req) => req.url === '/api/complaints');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('25');
    request.flush('Unavailable', { status: 503, statusText: 'Unavailable' });
    expect(failed).toBe(true);
    http.verify();
  });
});
