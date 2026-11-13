import { UserRole } from './auth';
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  municipality: string;
  active: boolean;
  joined: string;
}
export interface Crew {
  id: string;
  name: string;
  expertise: string;
  available: boolean;
  coordinates: [number, number];
  municipality: string;
}
export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  recordId: string;
  detail: string;
  seeded: boolean;
}
export interface ReviewEntry {
  id: string;
  timestamp: string;
  incidentId: string;
  kind: 'Classification' | 'Priority';
  before: string;
  after: string;
  actor: string;
  note: string;
}
export interface CategoryCount {
  label: string;
  count: number;
}
export interface TimeObservation {
  date: string;
  count: number;
  households: number;
}
export interface HotspotRow {
  code: string;
  barangay: string;
  municipality: string;
  incidents: number;
  households: number;
  critical: number;
  recurrence: number;
}
export interface RestorationRow {
  incidentId: string;
  estimatedHours: number;
  actualHours: number | null;
  timestamp: string;
  factors: { label: string; hours: number }[];
}
export interface ModelReadiness {
  id: string;
  name: string;
  method: string;
  required: string;
  ready: boolean;
  version: string | null;
}
export interface GeographySelection {
  code: string;
  barangay: string;
  municipality: string;
}
