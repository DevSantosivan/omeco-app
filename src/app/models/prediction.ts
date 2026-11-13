export type ModelState = 'simulated' | 'untrained' | 'validated' | 'unavailable';
export interface Prediction<T> {
  value: T | null;
  state: ModelState;
  modelVersion: string | null;
  generatedAt: string;
  confidence: number | null;
  explanation: string[];
  humanReviewed: boolean;
}
export interface NlpPrediction {
  category: string;
  language: string;
  tokens: string[];
}
export interface PriorityPrediction {
  priority: 'Routine' | 'Urgent' | 'Critical';
  factors: { name: string; contribution: number }[];
}
export interface ForecastPrediction {
  model: 'LSTM' | 'ARIMA' | 'SARIMA';
  observations: { timestamp: string; value: number }[];
  horizon: number;
}
export interface RestorationPrediction {
  durationHours: number;
  lowerHours: number | null;
  upperHours: number | null;
}
