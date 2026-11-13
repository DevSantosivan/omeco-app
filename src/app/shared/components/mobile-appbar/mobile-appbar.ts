import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationCenterComponent } from '../notification-center/notification-center';
import { IconComponent } from '../icon/icon';
@Component({
  selector: 'app-mobile-appbar',
  standalone: true,
  imports: [RouterLink, NotificationCenterComponent, IconComponent],
  templateUrl: './mobile-appbar.html',
  styleUrl: './mobile-appbar.scss',
})
export class MobileAppbarComponent {
  @Input({ required: true }) roleLabel = '';
  @Input({ required: true }) homeLink = '';
  @Input({ required: true }) profileLink = '';
  @Input() initials = 'O';
}
