import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { IconComponent } from '../../../shared/components/icon/icon';
@Component({
  selector: 'app-announcement-detail',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './announcement-detail.html',
  styleUrl: './announcement-detail.scss',
})
export class AnnouncementDetailComponent {
  private route = inject(ActivatedRoute);
  readonly announcements = inject(AnnouncementService);
  readonly item = this.announcements.byId(this.route.snapshot.paramMap.get('id') || '');
  constructor() {
    if (this.item) this.announcements.markRead(this.item.id);
  }
}
