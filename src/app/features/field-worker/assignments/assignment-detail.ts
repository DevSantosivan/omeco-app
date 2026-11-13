import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon';
import {
  AssignmentWorkflowService,
  ASSIGNMENT_STAGES,
  normalizeStage,
} from '../../../core/services/assignment-workflow.service';
@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
  templateUrl: './assignment-detail.html',
  styleUrl: './assignment-detail.scss',
})
export class AssignmentDetailComponent {
  readonly workflow = inject(AssignmentWorkflowService);
  private route = inject(ActivatedRoute);
  readonly record = computed(() =>
    this.workflow.assignments().find((x) => x.id === this.route.snapshot.paramMap.get('id')),
  );
  readonly stages = ASSIGNMENT_STAGES;
  readonly notes = signal('');
  readonly pending = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly current = computed(() => normalizeStage(this.record()?.status || 'Assigned'));
  readonly next = computed(() => this.stages[this.stages.indexOf(this.current()) + 1]);
  save(): void {
    const item = this.record(),
      next = this.next();
    if (!item || !next) return;
    const error = this.workflow.advance(item.id, next, this.notes());
    this.error.set(error || '');
    this.pending.set(false);
    if (!error) this.message.set('Progress saved. The member and dispatcher can see this update.');
  }
}
