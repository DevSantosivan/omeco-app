import { FormsModule } from '@angular/forms';
import { DisplayPreferencesService } from '../../../core/services/display-preferences.service';
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AdminPreferences } from './settings.models';
import { ThemeService } from '../../../core/services/theme.service';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, CommonModule, PageHeaderComponent, DataStateComponent, IconComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class AdminSettingsComponent {
  readonly store = inject(AdminWorkspaceService);
  readonly display = inject(DisplayPreferencesService);
  readonly theme = inject(ThemeService);
  readonly preferences = signal<AdminPreferences>({ ...this.display.saved() });
  readonly message = signal('');
  readonly confirmReset = signal(false);
  change(key: keyof AdminPreferences, value: string | boolean): void {
    this.preferences.update((p) => ({ ...p, [key]: value }));
  }
  save(): void {
    const p = this.preferences();
    if (!p.displayName.trim() || !p.email.includes('@')) {
      this.message.set('Enter a display name and valid demo email.');
      return;
    }
    try {
      this.display.save(p);
      this.store.repository.logEvent(
        'Settings update',
        'preferences',
        'Non-sensitive demo display and notification preferences saved',
        this.store.actor(),
      );
      this.message.set('Preferences saved on this browser.');
    } catch {
      this.message.set('Browser storage is unavailable; preferences apply for this view only.');
    }
  }
  signOut(): void {
    this.store.auth.signOut();
    location.assign('/login');
  }
  reset(): void {
    this.store.repository.recover();
    this.confirmReset.set(false);
    this.message.set('Incident demo state restored to the deterministic seed.');
  }
}
