export const CHART_COLORS = ['#2563EB', '#F97316', '#DC2626', '#16A36A', '#8B5CF6', '#EAB308'];
export type OmecoChartKind = 'line' | 'bar' | 'horizontalBar' | 'doughnut' | 'stackedBar';
export interface OmecoChartDataset {
  label: string;
  values: (number | null)[];
  color?: string;
  colors?: string[];
  forecast?: boolean;
}
