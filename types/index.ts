export type Provider = 'anthropic' | 'openai' | 'gemini';

export type ProviderKeys = {
  anthropic: string;
  openai: string;
  gemini: string;
};

export type Config = {
  id: string;
  label: string;
  provider: Provider;
  model: string;
  systemPrompt: string;
};

export type JudgeConfig = {
  provider: Provider;
  model: string;
};

export type RubricCriterion = {
  id: string;
  name: string;
  description: string;
  weight: number;
  color: string;
};

export type Row = {
  input: string;
  expectedOutput?: string;
};

export type ConfigOutput = {
  configId: string;
  configLabel: string;
  output: string;
  exactMatch?: boolean;
  councilScore: number;
  judge1Score: number;
  judge2Score?: number;
  rank: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
};

export type CouncilResult = {
  configOutputs: ConfigOutput[];
  rankedConfigIds: string[];
  outlierDetected: boolean;
  biasWarning: boolean;
};

export type EvalResult = {
  rowIndex: number;
  input: string;
  configOutputs: ConfigOutput[];
  councilResult?: CouncilResult;
  outlierDetected?: boolean;
  winner: string;
  error?: string;
};
