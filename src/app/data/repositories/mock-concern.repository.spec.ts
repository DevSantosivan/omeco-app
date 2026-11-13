import { MockConcernRepository } from './mock-concern.repository';

describe('MockConcernRepository', () => {
  beforeEach(() => sessionStorage.clear());
  it('adds and updates simulated concerns through its repository API', () => {
    const repository = new MockConcernRepository();
    const record = {
      id: 'OC-TEST',
      member: 'Demo',
      category: 'Low voltage',
      priority: 'Routine' as const,
      status: 'Received',
      location: 'Sample location',
      time: 'Today',
      households: 2,
      description: 'Test concern',
      language: 'English',
      assignedCrew: '',
    };
    repository.add(record);
    repository.update(record.id, { status: 'Reviewed' });
    expect(repository.findById(record.id)?.status).toBe('Reviewed');
    expect(repository.concerns()[0].id).toBe(record.id);
  });
  it('persists shared incident changes and records actual demo audit events', () => {
    const repository = new MockConcernRepository();
    const original = repository.concerns()[0];
    repository.update(original.id, { priority: 'Routine', repairNotes: 'Demo site review' });
    const restored = new MockConcernRepository();
    expect(restored.findById(original.id)?.priority).toBe('Routine');
    expect(restored.findById(original.id)?.coordinates).toEqual(original.coordinates);
    expect(restored.audit()[0].seeded).toBe(false);
    expect(restored.audit()[0].recordId).toBe(original.id);
  });
  it('exposes corrupted storage and can restore a deterministic valid sample', () => {
    sessionStorage.setItem('omeco-records-v3', '{invalid');
    const repository = new MockConcernRepository();
    expect(repository.error()).toContain('could not be read');
    repository.recover();
    expect(repository.error()).toBe('');
    expect(repository.concerns()).toHaveLength(96);
  });
  it('updates crew availability when an assignment starts and is restored', () => {
    const repository = new MockConcernRepository();
    const crew = repository.crews().find((item) => item.available)!;
    const incident = repository.concerns().find((item) => item.status === 'New')!;
    repository.update(incident.id, { assignedCrew: crew.name, status: 'Dispatched' });
    expect(repository.crews().find((item) => item.id === crew.id)?.available).toBe(false);
    repository.update(incident.id, { status: 'Restored' });
    expect(repository.crews().find((item) => item.id === crew.id)?.available).toBe(true);
  });
});
