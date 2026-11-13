export interface ModelSummary {
  models: number;
  trained: number;
  records: number;
  reviewed: number;
}
export interface DemoInference {
  id: string;
  timestamp: string;
  model: string;
  recordId: string;
  output: string;
  seeded: boolean;
}
