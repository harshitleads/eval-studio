import { NextRequest, NextResponse } from 'next/server';

type ProxyBody = {
  provider: 'anthropic' | 'openai' | 'gemini';
  model: string;
  apiKey: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
};

type ProxyResult = { text: string; inputTokens: number; outputTokens: number };

async function callAnthropic(body: ProxyBody): Promise<ProxyResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': body.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: body.model,
      max_tokens: body.maxTokens ?? 1024,
      system: body.systemPrompt || undefined,
      messages: [{ role: 'user', content: body.userMessage }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Anthropic API error');
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Anthropic');
  return {
    text,
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
  };
}

async function callOpenAI(body: ProxyBody): Promise<ProxyResult> {
  const messages: { role: string; content: string }[] = [];
  if (body.systemPrompt) {
    messages.push({ role: 'system', content: body.systemPrompt });
  }
  messages.push({ role: 'user', content: body.userMessage });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${body.apiKey}`,
    },
    body: JSON.stringify({
      model: body.model,
      max_tokens: body.maxTokens ?? 1024,
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'OpenAI API error');
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI');
  return {
    text,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  };
}

async function callGemini(body: ProxyBody): Promise<ProxyResult> {
  const combinedText = body.systemPrompt
    ? `${body.systemPrompt}\n\n${body.userMessage}`
    : body.userMessage;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${body.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: combinedText }] }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Gemini API error');
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return {
    text,
    inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProxyBody;

    if (!body.provider || !body.model || !body.apiKey || !body.userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, model, apiKey, userMessage' },
        { status: 400 }
      );
    }

    let result: ProxyResult;

    switch (body.provider) {
      case 'anthropic':
        result = await callAnthropic(body);
        break;
      case 'openai':
        result = await callOpenAI(body);
        break;
      case 'gemini':
        result = await callGemini(body);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${body.provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
