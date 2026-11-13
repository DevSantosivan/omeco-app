import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({
  selector: 'app-field-page',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './field-page.html',
  styleUrl: './field-page.scss',
})
export class FieldPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = (this.route.snapshot.data['page'] as string) ?? 'Field update';
}
