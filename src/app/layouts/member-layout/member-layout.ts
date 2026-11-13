import { MobileShellComponent } from '../../shared/components/mobile-shell/mobile-shell';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthPort } from '../../models/auth';

import { MobileNavItem } from '../../shared/components/mobile-bottom-nav/mobile-bottom-nav';
@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [RouterOutlet, MobileShellComponent],
  templateUrl: './member-layout.html',
  styleUrl: './member-layout.scss',
})
export class MemberLayoutComponent {
  readonly auth = inject(AuthPort);
  readonly nav: MobileNavItem[] = [
    { label: 'Home', link: '/member/home', icon: 'home' },
    { label: 'Report', link: '/member/report', icon: 'plus' },
    { label: 'My reports', link: '/member/reports', icon: 'file' },
    { label: 'Updates', link: '/member/updates', icon: 'bell' },
    { label: 'Profile', link: '/member/profile', icon: 'user' },
  ];
}
