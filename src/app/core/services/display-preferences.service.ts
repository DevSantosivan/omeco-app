import { Injectable, inject, signal } from '@angular/core';
import { AuthPort } from '../../models/auth';
export interface DisplayPreferences {
  displayName: string;
  email: string;
  compact: boolean;
  notifications: boolean;
  dispatchAlerts: boolean;
  language: string;
}
@Injectable({ providedIn: 'root' })
export class DisplayPreferencesService {
  private readonly auth = inject(AuthPort);
  readonly saved = signal<DisplayPreferences>(this.restore());
  constructor() {
    this.apply(this.saved());
  }
  save(value: DisplayPreferences): void {
    this.saved.set({ ...value });
    this.apply(value);
    localStorage.setItem('omeco-admin-preferences', JSON.stringify(value));
  }
  private apply(value: DisplayPreferences): void {
    document.documentElement.dataset['density'] = value.compact ? 'compact' : 'comfortable';
  }
  private restore(): DisplayPreferences {
    const defaults: DisplayPreferences = {
      displayName: this.auth.session()?.name || 'Demo Dispatcher',
      email: this.auth.session()?.email || 'admin@omeco.demo',
      compact: false,
      notifications: true,
      dispatchAlerts: true,
      language: 'English',
    };
    try {
      return {
        ...defaults,
        ...JSON.parse(localStorage.getItem('omeco-admin-preferences') || '{}'),
      };
    } catch {
      return defaults;
    }
  }
}
