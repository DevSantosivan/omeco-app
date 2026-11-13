import { Component, inject } from '@angular/core';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { MapView } from './map-view';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
@Component({
  selector: 'app-admin-map',
  standalone: true,
  imports: [MapView, PageHeaderComponent],
  templateUrl: './admin-map.html',
  styleUrl: './admin-map.scss',
})
export class AdminMapComponent {
  readonly repository = inject(ConcernRepository);
}
