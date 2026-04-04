export type Provider = 'anthropic' | 'openai' | 'gemini';

export const PROVIDERS: Record<Provider, {
  label: string;
  models: { id: string; label: string }[];
  endpoint: string;
}> = {
  anthropic: {
    label: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
      { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
    ],
    endpoint: 'https://api.anthropic.com/v1/messages',
  },
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  gemini: {
    label: 'Google Gemini',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    ],
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
};

export const PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  'claude-opus-4-6':           { inputPer1M: 5.00,  outputPer1M: 25.00 },
  'claude-sonnet-4-20250514':  { inputPer1M: 3.00,  outputPer1M: 15.00 },
  'claude-haiku-4-5-20251001': { inputPer1M: 1.00,  outputPer1M: 5.00  },
  'gpt-4o':                    { inputPer1M: 2.50,  outputPer1M: 10.00 },
  'gpt-4o-mini':               { inputPer1M: 0.15,  outputPer1M: 0.60  },
  'gpt-4-turbo':               { inputPer1M: 10.00, outputPer1M: 30.00 },
  'gemini-2.0-flash':          { inputPer1M: 0.10,  outputPer1M: 0.40  },
  'gemini-1.5-pro':            { inputPer1M: 1.25,  outputPer1M: 5.00  },
  'gemini-1.5-flash':          { inputPer1M: 0.075, outputPer1M: 0.30  },
};

export const PRICING_LAST_UPDATED = '2026-04-05';

export function computeCost(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model];
  if (!p) return 0;
  return (inputTokens / 1_000_000) * p.inputPer1M + (outputTokens / 1_000_000) * p.outputPer1M;
}
