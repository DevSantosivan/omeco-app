import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AssignmentWorkflowService,
  ASSIGNMENT_STAGES,
  normalizeStage,
} from '../../../core/services/assignment-workflow.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ListPager } from '../../../shared/utilities/list-pager';
import { SearchFieldComponent } from '../../../shared/components/search-field/search-field';
@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent, PaginationComponent, SearchFieldComponent],
  templateUrl: './assignments.html',
  styleUrl: './assignments.scss',
})
export class AssignmentsComponent {
  readonly workflow = inject(AssignmentWorkflowService);
  readonly query = signal('');
  readonly status = signal('All');
  readonly priority = signal('All');
  readonly stages = ASSIGNMENT_STAGES;
  readonly rows = computed(() =>
    this.workflow
      .assignments()
      .filter(
        (x) =>
          (x.id + ' ' + x.category + ' ' + x.location)
            .toLowerCase()
            .includes(this.query().toLowerCase()) &&
          (this.status() === 'All' || normalizeStage(x.status) === this.status()) &&
          (this.priority() === 'All' || x.priority === this.priority()),
      ),
  );
  readonly pager = new ListPager(() => this.rows());
  updateSearch(value: string): void {
    this.query.set(value);
    this.pager.reset();
  }
}
