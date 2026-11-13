import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthPort } from '../../../models/auth';
import { ThemeService } from '../../../core/services/theme.service';
import {
  MobileProfileComponent,
  ProfileInfoRow,
} from '../../../shared/components/mobile-profile/mobile-profile';
@Component({
  selector: 'app-field-worker-profile',
  standalone: true,
  imports: [MobileProfileComponent],
  templateUrl: './field-profile.html',
  styleUrl: './field-profile.scss',
})
export class FieldProfileComponent {
  readonly auth = inject(AuthPort);
  readonly theme = inject(ThemeService);
  private router = inject(Router);
  readonly notifications = signal(true);
  readonly message = signal('');
  constructor() {
    try {
      const value = JSON.parse(
        localStorage.getItem('omeco-profile-' + this.auth.session()?.email) || 'null',
      );
      if (value) {
        this.notifications.set(value.notifications);
      }
    } catch {
      /* Defaults remain available. */
    }
  }
  save(): void {
    try {
      localStorage.setItem(
        'omeco-profile-' + this.auth.session()?.email,
        JSON.stringify({ notifications: this.notifications() }),
      );
      this.message.set(
        'Preferences saved on this device. Account identity remains the demo fixture.',
      );
    } catch {
      this.message.set('Browser storage is unavailable.');
    }
  }
  readonly rows: ProfileInfoRow[] = [
    { label: 'Account email', value: this.auth.session()?.email || 'Not available', icon: 'user' },
    { label: 'Role', value: 'Field Worker · Demo', icon: 'hard-hat' },
    { label: 'Assigned operations group', value: 'Line Crew 01', icon: 'group' },
  ];
  setDarkMode(value: boolean): void {
    if ((this.theme.mode() === 'dark') !== value) this.theme.toggle();
  }
  signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/login']);
  }
}
