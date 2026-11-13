import { MemberRecordsService } from '../../../core/services/member-records.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { AuthPort } from '../../../models/auth';
import { AnnouncementService } from '../../../core/services/announcement.service';
@Component({
  selector: 'app-member-home',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './member-home.html',
  styleUrl: './member-home.scss',
})
export class MemberHomeComponent {
  readonly member = inject(MemberRecordsService);
  readonly repository = inject(ConcernRepository);
  readonly auth = inject(AuthPort);
  readonly announcements = inject(AnnouncementService);
}
