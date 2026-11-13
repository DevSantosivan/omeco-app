import { TestBed } from '@angular/core/testing';
import { AdminWorkspaceService } from './admin-workspace.service';
import { ConcernRepository } from '../../data/repositories/concern.repository';
import { MockConcernRepository } from '../../data/repositories/mock-concern.repository';
import { AuthPort } from '../../models/auth';
import { DemoAuthService } from '../auth/demo-auth.service';
describe('connected Admin demo actions', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: ConcernRepository, useClass: MockConcernRepository },
        { provide: AuthPort, useClass: DemoAuthService },
      ],
    });
    TestBed.inject(AuthPort).signIn('admin@omeco.demo');
  });
  it('shares reviewed classification and priority across repository consumers and audit history', () => {
    const store = TestBed.inject(AdminWorkspaceService);
    const repository = TestBed.inject(ConcernRepository);
    const incident = repository.concerns()[0];
    store.reviewCategory(incident.id, 'Low voltage', 'Human correction');
    store.reviewPriority(incident.id, 'Critical', 'Exposed line reported');
    expect(repository.findById(incident.id)?.category).toBe('Low voltage');
    expect(repository.findById(incident.id)?.priority).toBe('Critical');
    expect(
      store
        .histories()
        .some(
          (x) =>
            x.actor === 'Maria Reyes' &&
            x.incidentId === incident.id &&
            x.after.includes('Human correction'),
        ),
    ).toBe(true);
    expect(store.hotspots().reduce((sum, x) => sum + x.incidents, 0)).toBe(
      repository.concerns().length,
    );
  });
});
