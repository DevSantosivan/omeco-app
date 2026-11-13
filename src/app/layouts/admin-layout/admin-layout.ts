import { IconComponent } from '../../shared/components/icon/icon';
import { Component, signal, inject } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthPort } from '../../models/auth';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationCenterComponent } from '../../shared/components/notification-center/notification-center';
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [IconComponent, RouterOutlet, RouterLink, RouterLinkActive, NotificationCenterComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthPort);
  readonly theme = inject(ThemeService);

  readonly menuOpen = signal(false);
  readonly sections = [
    {
      title: 'Operations',
      links: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: 'grid-alt' },
        { label: 'Complaints', path: '/admin/complaints', icon: 'file' },
        { label: 'Crew dispatch', path: '/admin/dispatch', icon: 'send' },
        { label: 'Incident map', path: '/admin/map', icon: 'map' },
      ],
    },
    {
      title: 'Intelligence',
      links: [
        { label: 'NLP review', path: '/admin/nlp-review', icon: 'brain' },
        { label: 'Priority prediction', path: '/admin/priority-prediction', icon: 'error' },
        { label: 'Temporal trends', path: '/admin/temporal-trends', icon: 'line-chart' },
        { label: 'Spatial hotspots', path: '/admin/spatial-hotspots', icon: 'bell' },
        { label: 'Restoration estimate', path: '/admin/restoration-estimation', icon: 'time-five' },
        { label: 'Reports', path: '/admin/reports', icon: 'bar-chart-alt-2' },
      ],
    },
    {
      title: 'Administration',
      links: [
        { label: 'Users', path: '/admin/users', icon: 'user' },
        { label: 'Model monitoring', path: '/admin/model-monitoring', icon: 'chip' },
        { label: 'Audit trail', path: '/admin/audit-trail', icon: 'list-ul' },
        { label: 'Settings', path: '/admin/settings', icon: 'cog' },
      ],
    },
  ];
  signOut(): void {
    this.auth.signOut();
    location.assign('/login');
  }
}
