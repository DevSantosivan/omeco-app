import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, computed, inject } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
@Component({
  selector: 'app-admin-complaint-detail',
  standalone: true,
  imports: [IconComponent, RouterLink, PageHeaderComponent],
  templateUrl: './complaint-detail.html',
  styleUrl: './complaint-detail.scss',
})
export class AdminComplaintDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly repository = inject(ConcernRepository);

  readonly record = computed(() =>
    this.repository.findById(this.route.snapshot.paramMap.get('id') ?? ''),
  );
  reviewClassification(): void {
    const item = this.record();
    if (item) this.repository.update(item.id, { classificationReviewed: true });
  }
}
