"use client";

import { useState } from "react";
import { PROVIDERS } from "@/lib/providers";
import type { Config, Provider, ProviderKeys } from "@/types";

type ConfigBuilderProps = {
  providerKeys: ProviderKeys;
  onConfirm: (configs: Config[]) => void;
};

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function ConfigPanel({
  config,
  onChange,
  onRemove,
  canRemove,
  availableProviders,
}: {
  config: Config;
  onChange: (config: Config) => void;
  onRemove: () => void;
  canRemove: boolean;
  availableProviders: Provider[];
}) {
  const models = PROVIDERS[config.provider].models;

  return (
    <div
      className="rounded-[10px] p-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <input
          value={config.label}
          onChange={(e) => onChange({ ...config, label: e.target.value })}
          className="font-display text-[18px] font-bold bg-transparent border-none w-full"
          style={{ color: "var(--text)", outline: "none" }}
        />
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-[14px] font-body px-2 py-1 rounded-[6px] cursor-pointer ml-2 shrink-0"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              color: "var(--red)",
            }}
          >
            x
          </button>
        )}
      </div>

      <label
        className="block text-[13px] font-semibold font-body mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        Provider
      </label>
      <select
        value={config.provider}
        onChange={(e) => {
          const p = e.target.value as Provider;
          onChange({ ...config, provider: p, model: PROVIDERS[p].models[0].id });
        }}
        className="w-full text-[15px] font-body rounded-[8px] px-4 py-3 mb-4"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border-interactive)",
          color: "var(--text)",
        }}
      >
        {availableProviders.map((p) => (
          <option key={p} value={p}>{PROVIDERS[p].label}</option>
        ))}
      </select>

      <label
        className="block text-[13px] font-semibold font-body mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        Model
      </label>
      <select
        value={config.model}
        onChange={(e) => onChange({ ...config, model: e.target.value })}
        className="w-full text-[15px] font-body rounded-[8px] px-4 py-3 mb-4"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border-interactive)",
          color: "var(--text)",
        }}
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>

      <label
        className="block text-[13px] font-semibold font-body mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        System Prompt
      </label>
      <textarea
        value={config.systemPrompt}
        onChange={(e) => onChange({ ...config, systemPrompt: e.target.value })}
        placeholder="Enter system prompt..."
        rows={6}
        className="w-full text-[15px] font-body rounded-[8px] px-4 py-3 resize-y"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border-interactive)",
          color: "var(--text)",
        }}
      />
    </div>
  );
}

export default function ConfigBuilder({ providerKeys, onConfirm }: ConfigBuilderProps) {
  const availableProviders: Provider[] = (["anthropic", "openai", "gemini"] as Provider[]).filter(
    (p) => providerKeys[p].trim() !== ""
  );
  const defaultProvider = availableProviders[0] ?? "anthropic";

  const [configs, setConfigs] = useState<Config[]>([
    { id: genId(), label: "Config 1", provider: defaultProvider, model: PROVIDERS[defaultProvider].models[0].id, systemPrompt: "" },
    { id: genId(), label: "Config 2", provider: defaultProvider, model: PROVIDERS[defaultProvider].models.length > 1 ? PROVIDERS[defaultProvider].models[1].id : PROVIDERS[defaultProvider].models[0].id, systemPrompt: "" },
  ]);

  const updateConfig = (id: string, updated: Config) => {
    setConfigs(configs.map((c) => (c.id === id ? updated : c)));
  };

  const addConfig = () => {
    if (configs.length >= 4) return;
    setConfigs([...configs, {
      id: genId(),
      label: `Config ${configs.length + 1}`,
      provider: defaultProvider,
      model: PROVIDERS[defaultProvider].models[0].id,
      systemPrompt: "",
    }]);
  };

  const removeConfig = (id: string) => {
    if (configs.length <= 2) return;
    setConfigs(configs.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-2 gap-6 mb-6">
        {configs.map((config) => (
          <ConfigPanel
            key={config.id}
            config={config}
            onChange={(updated) => updateConfig(config.id, updated)}
            onRemove={() => removeConfig(config.id)}
            canRemove={configs.length > 2}
            availableProviders={availableProviders}
          />
        ))}
      </div>

      {configs.length < 4 && (
        <button
          onClick={addConfig}
          className="w-full text-[14px] font-body py-3 rounded-[8px] cursor-pointer mb-6"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border-interactive)",
            color: "var(--text-secondary)",
          }}
        >
          + Add Config
        </button>
      )}

      <button
        onClick={() => onConfirm(configs)}
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
