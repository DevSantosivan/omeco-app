import { OmecoNavItem, OmecoRole } from '../../models/concern';
export type { OmecoCase, OmecoNavItem, OmecoRole } from '../../models/concern';
export const OMECO_NAV: Record<OmecoRole, OmecoNavItem[]> = {
  admin: [
    { label: 'Dashboard', path: 'dashboard' },
    { label: 'Complaint Management', path: 'complaints', badge: '24' },
    { label: 'NLP Classification Review', path: 'nlp-review' },
    { label: 'Priority Prediction', path: 'priority-prediction' },
    { label: 'Crew Dispatch', path: 'dispatch' },
    { label: 'GIS Incident Map', path: 'map' },
    { label: 'Temporal Trend Analysis', path: 'temporal-trends' },
    { label: 'Spatial Hotspot Analysis', path: 'spatial-hotspots' },
    { label: 'Restoration Time Estimation', path: 'restoration-estimation' },
    { label: 'Reports & Analytics', path: 'analytics' },
    { label: 'User Management', path: 'users' },
    { label: 'Model Monitoring', path: 'model-monitoring' },
    { label: 'Settings', path: 'settings' },
  ],
  member: [
    { label: 'Home', path: 'home' },
    { label: 'Submit Concern', path: 'submit-concern' },
    { label: 'My Reports', path: 'my-reports', badge: '2' },
    { label: 'Updates', path: 'updates' },
    { label: 'Profile', path: 'profile' },
  ],
  'field-worker': [
    { label: 'Home', path: 'home' },
    { label: 'Assignments', path: 'assignments', badge: '3' },
    { label: 'Map', path: 'map' },
    { label: 'Updates', path: 'notifications' },
    { label: 'Profile', path: 'profile' },
    { label: 'Work Orders', path: 'work-orders' },
    { label: 'Repair Progress', path: 'repair-progress' },
    { label: 'Work History', path: 'work-history' },
  ],
};
export { INCIDENT_SEED as OMECO_CASES } from './admin-seed';
