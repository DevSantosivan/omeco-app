export interface DemoCrew {
  name: string;
  skills: string;
  distance: string;
  status: 'Available' | 'On assignment';
}

export interface DemoActivityPoint {
  label: string;
  value: number;
  tone: 'blue' | 'amber' | 'red';
}

export interface DemoServiceUpdate {
  icon: string;
  title: string;
  body: string;
  time: string;
}
export const DEMO_SERVICE_UPDATES: DemoServiceUpdate[] = [
  {
    icon: 'bell',
    title: 'Report received',
    body: 'Your report is in the cooperative review queue.',
    time: 'Today',
  },
  {
    icon: 'bolt-circle',
    title: 'Service information',
    body: 'Check back here for updates that may affect your area.',
    time: 'Recent',
  },
];
