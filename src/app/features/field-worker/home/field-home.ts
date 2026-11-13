import { AssignmentWorkflowService } from '../../../core/services/assignment-workflow.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, inject } from '@angular/core';

import { AuthPort } from '../../../models/auth';
import { RouterLink } from '@angular/router';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
@Component({
  selector: 'app-field-home',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './field-home.html',
  styleUrl: './field-home.scss',
})
export class FieldHomeComponent {
  readonly auth = inject(AuthPort);
  readonly workflow = inject(AssignmentWorkflowService);
  get active(): number {
    return this.workflow.assignments().filter((x) => /progress|repair/i.test(x.status)).length;
  }
  get complete(): number {
    return this.workflow.assignments().filter((x) => /restored|resolved|complete/i.test(x.status))
      .length;
  }
  readonly repository = inject(ConcernRepository);
}
