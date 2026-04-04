import type { Provider, ProviderKeys } from '@/types';

export type CallModelResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
};

export async function callModel(
  input: string,
  systemPrompt: string,
  provider: Provider,
  model: string,
  providerKeys: ProviderKeys
): Promise<CallModelResult> {
  const apiKey = providerKeys[provider];
  if (!apiKey) {
    throw new Error(`No API key provided for ${provider}`);
  }

  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider,
      model,
      apiKey,
      systemPrompt,
      userMessage: input,
      maxTokens: 1024,
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.text) {
    throw new Error('Empty response from model');
  }

  return {
    text: data.text,
    inputTokens: data.inputTokens ?? 0,
    outputTokens: data.outputTokens ?? 0,
  };
}
