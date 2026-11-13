import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AssignmentWorkflowService } from './assignment-workflow.service';
import { ConcernRepository } from '../../data/repositories/concern.repository';
import { MockConcernRepository } from '../../data/repositories/mock-concern.repository';
import { AuthPort } from '../../models/auth';
describe('Connected crew workflow', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: ConcernRepository, useClass: MockConcernRepository },
        {
          provide: AuthPort,
          useValue: { session: signal({ name: 'Jose Lim', role: 'field-worker' }) },
        },
      ],
    });
  });
  it('rejects skipped stages and other crews, then records each accepted transition', () => {
    const workflow = TestBed.inject(AssignmentWorkflowService);
    const repo = TestBed.inject(ConcernRepository);
    const item = repo.concerns().find((x) => !x.assignedCrew)!;
    repo.update(item.id, { assignedCrew: 'Line Crew 01', status: 'Dispatched' });
    expect(workflow.advance(item.id, 'On Site', 'Inspection')).toContain('one stage');
    expect(workflow.advance(item.id, 'Accepted', 'Accepted work')).toBeNull();
    expect(workflow.advance(item.id, 'En Route', 'Travelling')).toBeNull();
    expect(workflow.advance(item.id, 'On Site', 'At site')).toBeNull();
    expect(workflow.advance(item.id, 'Repair In Progress', 'Repairing')).toBeNull();
    expect(workflow.advance(item.id, 'Completed', '')).toContain('12');
    expect(
      workflow.advance(item.id, 'Completed', 'Repaired damaged insulation and tested supply.'),
    ).toBeNull();
    expect(repo.findById(item.id)?.resolvedAt).toBeTruthy();
    expect(repo.audit()[0].seeded).toBe(false);
    const other = repo.concerns().find((x) => x.assignedCrew === 'Line Crew 02')!;
    expect(workflow.advance(other.id, 'Completed', 'Not authorized')).toContain('not assigned');
  });
});
