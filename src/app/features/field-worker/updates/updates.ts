import { Component, computed, inject } from '@angular/core';

import { AssignmentWorkflowService } from '../../../core/services/assignment-workflow.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ListPager } from '../../../shared/utilities/list-pager';
@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './updates.html',
  styleUrl: './updates.scss',
})
export class FieldUpdatesComponent {
  readonly workflow = inject(AssignmentWorkflowService);
  readonly rows = computed(() =>
    this.workflow.repository
      .audit()
      .filter((x) => this.workflow.assignments().some((a) => a.id === x.recordId)),
  );
  readonly pager = new ListPager(() => this.rows());
}
