import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AssignmentWorkflowService } from '../../../core/services/assignment-workflow.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ListPager } from '../../../shared/utilities/list-pager';
@Component({
  selector: 'app-work-history',
  standalone: true,
  imports: [RouterLink, PaginationComponent],
  templateUrl: './work-history.html',
  styleUrl: './work-history.scss',
})
export class WorkHistoryComponent {
  readonly workflow = inject(AssignmentWorkflowService);
  readonly rows = computed(() =>
    this.workflow.assignments().filter((x) => /completed|resolved|restored/i.test(x.status)),
  );
  readonly pager = new ListPager(() => this.rows());
}
