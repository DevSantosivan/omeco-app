import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icon/icon';
export interface MobileNavItem {
  label: string;
  link: string;
  icon: string;
  exact?: boolean;
}
@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './mobile-bottom-nav.html',
  styleUrl: './mobile-bottom-nav.scss',
})
export class MobileBottomNavComponent {
  @Input({ required: true }) items: MobileNavItem[] = [];
  @Input() label = 'Mobile navigation';
}
