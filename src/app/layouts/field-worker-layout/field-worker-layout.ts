import { MobileShellComponent } from '../../shared/components/mobile-shell/mobile-shell';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthPort } from '../../models/auth';

import { MobileNavItem } from '../../shared/components/mobile-bottom-nav/mobile-bottom-nav';
@Component({
  selector: 'app-field-worker-layout',
  standalone: true,
  imports: [RouterOutlet, MobileShellComponent],
  templateUrl: './field-worker-layout.html',
  styleUrl: './field-worker-layout.scss',
})
export class FieldWorkerLayoutComponent {
  readonly auth = inject(AuthPort);
  private readonly router = inject(Router);
  readonly mapMode = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.includes('/field-worker/map')),
      startWith(this.router.url.includes('/field-worker/map')),
    ),
    { initialValue: false },
  );
  readonly nav: MobileNavItem[] = [
    { label: 'Home', link: '/field-worker/home', icon: 'home' },
    { label: 'Assignments', link: '/field-worker/assignments', icon: 'file' },
    { label: 'Map', link: '/field-worker/map', icon: 'map' },
    { label: 'Updates', link: '/field-worker/updates', icon: 'bell' },
    { label: 'Profile', link: '/field-worker/profile', icon: 'user' },
  ];
}
