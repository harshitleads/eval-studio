"use client";

import { useState } from "react";
import type { Provider, ProviderKeys } from "@/types";

type KeyEntryProps = {
  onConfirm: (keys: ProviderKeys) => void;
};

const PROVIDER_CARDS: {
  provider: Provider;
  label: string;
  accent: string;
  placeholder: string;
}[] = [
  { provider: "anthropic", label: "Anthropic", accent: "var(--green)", placeholder: "sk-ant-..." },
  { provider: "openai", label: "OpenAI", accent: "var(--blue)", placeholder: "sk-..." },
  { provider: "gemini", label: "Google Gemini", accent: "var(--amber)", placeholder: "AIza..." },
];

function ProviderCard({
  label,
  accent,
  placeholder,
  apiKey,
  onApiKeyChange,
}: {
  label: string;
  accent: string;
  placeholder: string;
  apiKey: string;
  onApiKeyChange: (k: string) => void;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div
      className="rounded-[10px] p-6 mb-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div className="font-display text-[18px] font-bold mb-4" style={{ color: "var(--text)" }}>
        {label}
      </div>

      <label
        className="block text-[13px] font-semibold font-body mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        API Key
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type={showKey ? "text" : "password"}
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-[15px] font-body rounded-[8px] px-4 py-3"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border-interactive)",
            color: "var(--text)",
          }}
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="text-[14px] font-body px-4 rounded-[8px] cursor-pointer"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border-interactive)",
            color: "var(--text-secondary)",
          }}
        >
          {showKey ? "hide" : "show"}
        </button>
      </div>
      <p className="text-[14px] font-body" style={{ color: "var(--text-muted)" }}>
        Leave empty if not using this provider
      </p>
    </div>
  );
}

export default function KeyEntry({ onConfirm }: KeyEntryProps) {
  const [keys, setKeys] = useState<ProviderKeys>({
    anthropic: "",
    openai: "",
    gemini: "",
  });

  const hasAtLeastOneKey = keys.anthropic.trim() !== "" || keys.openai.trim() !== "" || keys.gemini.trim() !== "";

  return (
    <div className="max-w-2xl mx-auto">
      {PROVIDER_CARDS.map((card) => (
        <ProviderCard
          key={card.provider}
          label={card.label}
          accent={card.accent}
          placeholder={card.placeholder}
          apiKey={keys[card.provider]}
          onApiKeyChange={(k) => setKeys({ ...keys, [card.provider]: k })}
        />
      ))}

      <p className="text-[13px] font-body mb-6" style={{ color: "var(--text-muted)" }}>
        Your keys are sent only to their respective provider APIs via our server proxy. Never stored. Cleared when you close this tab.
      </p>

      <button
        onClick={() => onConfirm(keys)}
        disabled={!hasAtLeastOneKey}
        className="w-full text-[15px] font-semibold font-body py-3.5 rounded-[8px] cursor-pointer transition-opacity"
        style={{
          background: "rgba(0, 232, 122, 0.08)",
          border: "1px solid rgba(0, 232, 122, 0.25)",
          color: "var(--green)",
        }}
      >
        Continue
      </button>
    </div>
  );
}
