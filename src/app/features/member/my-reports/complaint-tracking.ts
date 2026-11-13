import { MemberRecordsService } from '../../../core/services/member-records.service';
import { Component, computed, inject } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
@Component({
  selector: 'app-complaint-tracking',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  templateUrl: './complaint-tracking.html',
  styleUrl: './complaint-tracking.scss',
})
export class ComplaintTrackingComponent {
  readonly member = inject(MemberRecordsService);
  private readonly route = inject(ActivatedRoute);
  readonly repository = inject(ConcernRepository);

  readonly record = computed(() =>
    this.member.records().find((x) => x.id === this.route.snapshot.paramMap.get('id')),
  );
}
