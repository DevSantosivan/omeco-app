import { Injectable, computed, inject } from '@angular/core';
import { ConcernRepository } from '../../data/repositories/concern.repository';
import { AuthPort } from '../../models/auth';
export const ASSIGNMENT_STAGES = [
  'Assigned',
  'Accepted',
  'En Route',
  'On Site',
  'Repair In Progress',
  'Completed',
] as const;
export type AssignmentStage = (typeof ASSIGNMENT_STAGES)[number];
export function normalizeStage(status: string): AssignmentStage {
  if (/complete|restored|resolved/i.test(status)) return 'Completed';
  if (/work in progress|repair in progress/i.test(status)) return 'Repair In Progress';
  return ASSIGNMENT_STAGES.find((x) => x === status) || 'Assigned';
}
@Injectable({ providedIn: 'root' })
export class AssignmentWorkflowService {
  readonly repository = inject(ConcernRepository);
  readonly auth = inject(AuthPort);
  readonly crewName = 'Line Crew 01';
  readonly assignments = computed(() =>
    this.repository.concerns().filter((x) => x.assignedCrew === this.crewName),
  );
  advance(id: string, next: AssignmentStage, notes: string): string | null {
    const item = this.assignments().find((x) => x.id === id);
    if (this.auth.session()?.role !== 'field-worker' || !item)
      return 'This work order is not assigned to your crew.';
    const current = normalizeStage(item.status);
    if (ASSIGNMENT_STAGES.indexOf(next) !== ASSIGNMENT_STAGES.indexOf(current) + 1)
      return 'Advance one stage at a time.';
    if (next === 'Completed' && notes.trim().length < 12)
      return 'Add at least 12 characters describing the completed work.';
    this.repository.update(id, {
      status: next,
      repairNotes: notes,
      ...(next === 'Completed' ? { resolvedAt: new Date().toISOString() } : {}),
    });
    this.repository.logEvent(
      'Repair progress',
      id,
      current + ' → ' + next,
      this.auth.session()?.name,
    );
    return null;
  }
}
