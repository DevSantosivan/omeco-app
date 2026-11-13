import { Injectable, signal } from '@angular/core';
export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.restore());
  constructor() {
    this.apply(this.mode());
  }
  toggle(): void {
    this.set(this.mode() === 'light' ? 'dark' : 'light');
  }
  set(mode: ThemeMode): void {
    this.mode.set(mode);
    this.apply(mode);
    try {
      localStorage.setItem('omeco-theme', mode);
    } catch {
      /* Theme still applies for this session. */
    }
  }
  private restore(): ThemeMode {
    try {
      return localStorage.getItem('omeco-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
  private apply(mode: ThemeMode): void {
    if (typeof document !== 'undefined') document.documentElement.dataset['theme'] = mode;
  }
}
