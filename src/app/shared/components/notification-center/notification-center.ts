import { DisplayPreferencesService } from '../../../core/services/display-preferences.service';
import { IconComponent } from '../icon/icon';
import { Component, signal, inject } from '@angular/core';

import { NotificationCenterService } from '../../../core/services/notification-center.service';
@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss',
})
export class NotificationCenterComponent {
  readonly preferences = inject(DisplayPreferencesService);
  readonly center = inject(NotificationCenterService);

  readonly open = signal(false);
  toggle(): void {
    this.open.update((value) => !value);
  }
  markRead(): void {
    this.center.markAllRead();
  }
}
