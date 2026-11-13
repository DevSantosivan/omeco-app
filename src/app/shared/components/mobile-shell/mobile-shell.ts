import { Component, Input } from '@angular/core';
import { MobileAppbarComponent } from '../mobile-appbar/mobile-appbar';
import { MobileBottomNavComponent, MobileNavItem } from '../mobile-bottom-nav/mobile-bottom-nav';
@Component({
  selector: 'app-mobile-shell',
  standalone: true,
  imports: [MobileAppbarComponent, MobileBottomNavComponent],
  templateUrl: './mobile-shell.html',
  styleUrl: './mobile-shell.scss',
})
export class MobileShellComponent {
  @Input({ required: true }) roleLabel = '';
  @Input({ required: true }) homeLink = '';
  @Input({ required: true }) profileLink = '';
  @Input({ required: true }) nav: MobileNavItem[] = [];
  @Input() initials = 'O';
  @Input() mapMode = false;
}
