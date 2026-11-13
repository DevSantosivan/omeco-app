import { Component, inject } from '@angular/core';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class AdminAnalyticsComponent {
  readonly repository = inject(ConcernRepository);

  readonly periods = ['Monthly sample', 'Summer season', 'Rainy season'];
}
