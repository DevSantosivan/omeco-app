import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon';
export interface ProfileInfoRow {
  label: string;
  value: string;
  icon: string;
}
@Component({
  selector: 'app-mobile-profile',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './mobile-profile.html',
  styleUrl: './mobile-profile.scss',
})
export class MobileProfileComponent {
  @Input({ required: true }) name = '';
  @Input({ required: true }) role = '';
  @Input() email = '';
  @Input() rows: ProfileInfoRow[] = [];
  @Input() notifications = true;
  @Input() darkMode = false;
  @Input() message = '';
  @Output() notificationsChange = new EventEmitter<boolean>();
  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
