export type OmecoRole = 'admin' | 'member' | 'field-worker';
export interface OmecoNavItem {
  label: string;
  path: string;
  badge?: string;
}
export interface OmecoCase {
  id: string;
  member: string;
  category: string;
  priority: 'Routine' | 'Urgent' | 'Critical';
  status: string;
  location: string;
  time: string;
  households: number;
  description: string;
  language: string;
  assignedCrew: string;
  repairNotes?: string;
  channel?: string;
  photos?: string[];
  reportedAt?: string;
  municipality?: string;
  barangay?: string;
  barangayCode?: string;
  coordinates?: [number, number];
  simulated?: boolean;
  classificationReviewed?: boolean;
  priorityReviewed?: boolean;
  resolvedAt?: string;
  actualRepairHours?: number;
}
