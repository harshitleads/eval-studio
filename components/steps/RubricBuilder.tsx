"use client";

import { useState } from "react";
import { PROVIDERS } from "@/lib/providers";
import type { RubricCriterion, JudgeConfig, Provider, ProviderKeys } from "@/types";

type RubricBuilderProps = {
  providerKeys: ProviderKeys;
  configProviders: Provider[];
  onConfirm: (rubric: RubricCriterion[], judge1: JudgeConfig, judge2: JudgeConfig | null) => void;
};

const ACCENT_COLORS = ["#00e87a", "#38bdf8", "#f59e0b", "#f87171", "#c084fc", "#ffd700"];

const DEFAULT_RUBRICS: RubricCriterion[] = [
  { id: "accuracy", name: "Accuracy", description: "Factually correct and precise", weight: 30, color: "#00e87a" },
  { id: "clarity", name: "Clarity", description: "Clear, readable, well-structured", weight: 25, color: "#38bdf8" },
  { id: "relevance", name: "Relevance", description: "Directly addresses the prompt", weight: 25, color: "#f59e0b" },
  { id: "safety", name: "Safety", description: "No harmful or biased content", weight: 20, color: "#f87171" },
];

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export default function RubricBuilder({
  providerKeys,
  configProviders,
  onConfirm,
}: RubricBuilderProps) {
  const [rubrics, setRubrics] = useState<RubricCriterion[]>(DEFAULT_RUBRICS);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", weight: 25, color: "#00e87a" });

  const availableProviders: Provider[] = (["anthropic", "openai", "gemini"] as Provider[]).filter(
    (p) => providerKeys[p].trim() !== ""
  );

  const [j1Provider, setJ1Provider] = useState<Provider>(availableProviders[0] ?? "anthropic");
  const [j1Model, setJ1Model] = useState(PROVIDERS[availableProviders[0] ?? "anthropic"].models[0].id);

  const [j2Enabled, setJ2Enabled] = useState(availableProviders.length > 1);
  const [j2Provider, setJ2Provider] = useState<Provider>(availableProviders[1] ?? availableProviders[0] ?? "anthropic");
  const [j2Model, setJ2Model] = useState(PROVIDERS[availableProviders[1] ?? availableProviders[0] ?? "anthropic"].models[0].id);

  const totalWeight = rubrics.reduce((s, r) => s + r.weight, 0);

  const judgeProviders = [j1Provider, ...(j2Enabled ? [j2Provider] : [])];
  const biasDetected = judgeProviders.some(j => configProviders.includes(j));

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setRubrics(rubrics.map((r) => (r.id === editing ? { ...r, ...form } : r)));
    } else {
      setRubrics([...rubrics, { ...form, id: genId() }]);
    }
    setEditing(null);
    setForm({ name: "", description: "", weight: 25, color: "#00e87a" });
  };

  const startEdit = (r: RubricCriterion) => {
    setEditing(r.id);
    setForm({ name: r.name, description: r.description, weight: r.weight, color: r.color });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: "", description: "", weight: 25, color: "#00e87a" });
  };

  const canRun = totalWeight === 100;

  const handleRun = () => {
    const judge1: JudgeConfig = { provider: j1Provider, model: j1Model };
    const judge2: JudgeConfig | null = j2Enabled ? { provider: j2Provider, model: j2Model } : null;
    onConfirm(rubrics, judge1, judge2);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Section 1: Rubric */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 340px" }}>
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[13px] font-semibold font-body" style={{ color: "var(--text-secondary)" }}>
              Criteria ({rubrics.length} defined, {totalWeight}% total)
            </span>
            <span
              className="text-[13px] font-body rounded-[6px] px-2 py-0.5"
              style={{
                color: totalWeight === 100 ? "var(--green)" : "var(--amber)",
                background: totalWeight === 100 ? "rgba(0, 232, 122, 0.08)" : "rgba(245, 158, 11, 0.08)",
                border: `1px solid ${totalWeight === 100 ? "rgba(0, 232, 122, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
              }}
            >
              {totalWeight === 100 ? "Balanced" : `${totalWeight > 100 ? "+" : ""}${totalWeight - 100}% off`}
            </span>
          </div>

          {rubrics.map((r) => (
            <div
              key={r.id}
              className="rounded-[10px] p-4 mb-3 flex items-center gap-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${r.color}`,
              }}
            >
              <div className="flex-1">
                <div className="text-[14px] font-body font-medium mb-0.5" style={{ color: "var(--text)" }}>
                  {r.name}
                </div>
                <div className="text-[13px] font-body" style={{ color: "var(--text-muted)" }}>
                  {r.description}
                </div>
              </div>
              <div className="font-mono text-xl font-bold min-w-[48px] text-right" style={{ color: r.color }}>
                {r.weight}%
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(r)}
                  className="text-[13px] font-body px-2.5 py-1 rounded-[6px] cursor-pointer"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-interactive)", color: "var(--text-secondary)" }}
                >
                  edit
                </button>
                <button
                  onClick={() => setRubrics(rubrics.filter((x) => x.id !== r.id))}
                  className="text-[13px] font-body px-2.5 py-1 rounded-[6px] cursor-pointer"
                  style={{ background: "var(--surface)", border: "1px solid rgba(248, 113, 113, 0.2)", color: "var(--red)" }}
                >
                  x
                </button>
              </div>
            </div>
          ))}

          {rubrics.length === 0 && (
            <div className="text-center text-[14px] font-body py-10" style={{ color: "var(--text-muted)" }}>
              No criteria defined. Add one in the form.
            </div>
          )}
        </div>

        {/* Form panel */}
        <div className="rounded-[10px] p-6 h-fit" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="font-display text-[18px] font-bold mb-4" style={{ color: "var(--text)" }}>
            {editing ? "Edit Criterion" : "New Criterion"}
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Tone"
              className="w-full text-[15px] font-body rounded-[8px] px-4 py-3"
              style={{ background: "var(--card)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What does this measure?"
              className="w-full text-[15px] font-body rounded-[8px] px-4 py-3"
              style={{ background: "var(--card)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}
            />
          </div>

          <div className="mb-4">
            <label className="flex justify-between text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>
              <span>Weight</span><span style={{ color: "var(--green)" }}>{form.weight}%</span>
            </label>
            <input type="range" min={5} max={60} value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--green)" }} />
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-[26px] h-[26px] rounded-[8px] cursor-pointer"
                  style={{ background: c, border: form.color === c ? "3px solid #fff" : "3px solid transparent" }}
                />
              ))}
            </div>
          </div>

          <button onClick={save} className="w-full text-[15px] font-semibold font-body py-3 rounded-[8px] cursor-pointer" style={{ background: "rgba(0, 232, 122, 0.08)", border: "1px solid rgba(0, 232, 122, 0.25)", color: "var(--green)" }}>
            {editing ? "Update Criterion" : "+ Add Criterion"}
          </button>
          {editing && (
            <button onClick={cancelEdit} className="w-full text-[14px] font-body py-2.5 rounded-[8px] cursor-pointer mt-2" style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Section 2: Judge Council */}
      <div className="mt-8 rounded-[10px] p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="font-display text-[18px] font-bold mb-4" style={{ color: "var(--text)" }}>
          Judge Council
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Judge 1 */}
          <div>
            <label className="block text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>Judge 1 (required)</label>
            <select
              value={j1Provider}
              onChange={(e) => { const p = e.target.value as Provider; setJ1Provider(p); setJ1Model(PROVIDERS[p].models[0].id); }}
              className="w-full text-[15px] font-body rounded-[8px] px-4 py-3 mb-3"
              style={{ background: "var(--card)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}
            >
              {availableProviders.map((p) => (<option key={p} value={p}>{PROVIDERS[p].label}</option>))}
            </select>
            <select
              value={j1Model}
              onChange={(e) => setJ1Model(e.target.value)}
              className="w-full text-[15px] font-body rounded-[8px] px-4 py-3"
              style={{ background: "var(--card)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}
            >
              {PROVIDERS[j1Provider].models.map((m) => (<option key={m.id} value={m.id}>{m.label}</option>))}
            </select>
          </div>

          {/* Judge 2 */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="text-[13px] font-semibold font-body" style={{ color: "var(--text-secondary)" }}>Judge 2 (optional)</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={j2Enabled} onChange={(e) => setJ2Enabled(e.target.checked)} style={{ accentColor: "var(--green)" }} />
                <span className="text-[13px] font-body" style={{ color: "var(--text-muted)" }}>Enable</span>
              </label>
            </div>
            {j2Enabled ? (
              <>
                <select
                  value={j2Provider}
                  onChange={(e) => { const p = e.target.value as Provider; setJ2Provider(p); setJ2Model(PROVIDERS[p].models[0].id); }}
                  className="w-full text-[15px] font-body rounded-[8px] px-4 py-3 mb-3"
                  style={{ background: "var(--card)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}
                >
                  {availableProviders.map((p) => (<option key={p} value={p}>{PROVIDERS[p].label}</option>))}
                </select>
                <select
                  value={j2Model}
                  onChange={(e) => setJ2Model(e.target.value)}
                  className="w-full text-[15px] font-body rounded-[8px] px-4 py-3"
                  style={{ background: "var(--card)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}
                >
                  {PROVIDERS[j2Provider].models.map((m) => (<option key={m.id} value={m.id}>{m.label}</option>))}
                </select>
              </>
            ) : (
              <div className="text-[14px] font-body py-3" style={{ color: "var(--text-muted)" }}>
                Single judge mode. Enable for reduced bias.
              </div>
            )}
          </div>
        </div>

        {/* Bias warning */}
        {biasDetected && (
          <div
            className="text-[14px] font-body p-4 rounded-[8px]"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "var(--amber)",
            }}
          >
            One or more judges share a provider with a config being tested. For most accurate results, use judge providers different from your config providers.
          </div>
        )}
      </div>

      {/* Run Eval */}
      <button
        onClick={handleRun}
        disabled={!canRun}
        className="w-full text-[15px] font-semibold font-body py-3.5 rounded-[8px] cursor-pointer transition-opacity mt-6"
        style={{
          background: "rgba(56, 189, 248, 0.08)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          color: "var(--blue)",
        }}
      >
        {!canRun ? `Weights must sum to 100% (currently ${totalWeight}%)` : "Run Eval"}
      </button>
    </div>
  );
}
