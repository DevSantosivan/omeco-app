import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthPort } from '../../../models/auth';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
})
export class AccessDeniedPage {
  readonly auth = inject(AuthPort);
}
