export async function callModel(
  input: string,
  systemPrompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt || undefined,
      messages: [{ role: "user", content: input }],
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "API request failed");
  }

  const text = data.content?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from model");
  }

  return text;
}
