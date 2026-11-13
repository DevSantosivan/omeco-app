export type AnnouncementType =
  'Interruption' | 'Outage advisory' | 'Restoration' | 'Maintenance' | 'General';
export interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  summary: string;
  description: string;
  publishedAt: string;
  affectedArea?: string;
  schedule?: string;
  status: 'Scheduled' | 'Active' | 'Restored' | 'Completed' | 'Published';
  lastUpdated?: string;
  icon: string;
}
