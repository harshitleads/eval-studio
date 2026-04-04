import { useState, useEffect, useRef } from "react";

const ANTHROPIC_MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
];

const DEFAULT_RUBRICS = [
  { id: "accuracy", name: "Accuracy", description: "Factually correct and precise", weight: 30, color: "#00ff88" },
  { id: "clarity", name: "Clarity", description: "Clear, readable, well-structured", weight: 25, color: "#00d4ff" },
  { id: "relevance", name: "Relevance", description: "Directly addresses the prompt", weight: 25, color: "#ff9500" },
  { id: "safety", name: "Safety", description: "No harmful or biased content", weight: 20, color: "#ff4444" },
];

const genId = () => Math.random().toString(36).slice(2, 9);

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span style={{ color: "#666", fontFamily: "monospace", fontSize: 12 }}>—</span>;
  const color = score >= 80 ? "#00ff88" : score >= 60 ? "#ff9500" : "#ff4444";
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 13,
      fontWeight: 700,
      color,
      background: color + "18",
      border: `1px solid ${color}40`,
      borderRadius: 4,
      padding: "2px 8px",
    }}>{score}</span>
  );
}

function Spinner() {
  return (
    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #333", borderTop: "2px solid #00ff88", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  );
}

function Tab({ label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer",
      padding: "10px 20px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 13,
      color: active ? "#00ff88" : "#666",
      borderBottom: active ? "2px solid #00ff88" : "2px solid transparent",
      transition: "all 0.2s",
      position: "relative",
    }}>
      {label}
      {badge > 0 && (
        <span style={{
          marginLeft: 6,
          background: "#00ff8830",
          color: "#00ff88",
          borderRadius: 10,
          fontSize: 10,
          padding: "1px 6px",
          fontWeight: 700,
        }}>{badge}</span>
      )}
    </button>
  );
}

// ─── RUBRIC BUILDER ──────────────────────────────────────────────────────────

function RubricBuilder({ rubrics, setRubrics }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", weight: 25, color: "#00ff88" });

  const totalWeight = rubrics.reduce((s, r) => s + r.weight, 0);

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setRubrics(r => r.map(x => x.id === editing ? { ...x, ...form } : x));
    } else {
      setRubrics(r => [...r, { ...form, id: genId() }]);
    }
    setEditing(null);
    setForm({ name: "", description: "", weight: 25, color: "#00ff88" });
  };

  const startEdit = (r) => {
    setEditing(r.id);
    setForm({ name: r.name, description: r.description, weight: r.weight, color: r.color });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
      {/* Rubric list */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 2 }}>
            Criteria · {rubrics.length} defined · {totalWeight}% total weight
          </span>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: totalWeight === 100 ? "#00ff88" : "#ff9500",
            background: totalWeight === 100 ? "#00ff8815" : "#ff950015",
            border: `1px solid ${totalWeight === 100 ? "#00ff8840" : "#ff950040"}`,
            borderRadius: 4, padding: "2px 8px",
          }}>
            {totalWeight === 100 ? "✓ Balanced" : `${totalWeight > 100 ? "↑" : "↓"} ${Math.abs(totalWeight - 100)}% off`}
          </span>
        </div>

        {rubrics.map(r => (
          <div key={r.id} style={{
            background: "#111", border: "1px solid #222", borderLeft: `3px solid ${r.color}`,
            borderRadius: 8, padding: "14px 18px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#e8e8e8", marginBottom: 3 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{r.description}</div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: r.color, minWidth: 48, textAlign: "right" }}>
              {r.weight}%
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => startEdit(r)} style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>edit</button>
              <button onClick={() => setRubrics(r2 => r2.filter(x => x.id !== r.id))} style={{ background: "#1a1a1a", border: "1px solid #331515", color: "#ff4444", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>×</button>
            </div>
          </div>
        ))}

        {rubrics.length === 0 && (
          <div style={{ textAlign: "center", color: "#444", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "40px 0" }}>
            No criteria defined. Add one →
          </div>
        )}
      </div>

      {/* Form */}
      <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
          {editing ? "Edit Criterion" : "New Criterion"}
        </div>

        {[
          { label: "Name", key: "name", type: "text", placeholder: "e.g. Tone" },
          { label: "Description", key: "description", type: "text", placeholder: "What does this measure?" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", marginBottom: 6 }}>{f.label}</label>
            <input
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 6, padding: "9px 12px", color: "#e8e8e8", fontFamily: "'DM Mono', monospace", fontSize: 13, boxSizing: "border-box", outline: "none" }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", marginBottom: 6 }}>
            <span>Weight</span><span style={{ color: "#00ff88" }}>{form.weight}%</span>
          </label>
          <input type="range" min={5} max={60} value={form.weight} onChange={e => setForm(p => ({ ...p, weight: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: "#00ff88" }} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", marginBottom: 6 }}>Accent Color</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["#00ff88", "#00d4ff", "#ff9500", "#ff4444", "#c084fc", "#ffd700"].map(c => (
              <div key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{
                width: 26, height: 26, borderRadius: 6, background: c, cursor: "pointer",
                border: form.color === c ? `3px solid #fff` : "3px solid transparent",
                boxSizing: "border-box",
              }} />
            ))}
          </div>
        </div>

        <button onClick={save} style={{
          width: "100%", background: "#00ff8820", border: "1px solid #00ff8860",
          color: "#00ff88", borderRadius: 6, padding: "10px 0", cursor: "pointer",
          fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
        }}>
          {editing ? "Update Criterion" : "+ Add Criterion"}
        </button>
        {editing && (
          <button onClick={() => { setEditing(null); setForm({ name: "", description: "", weight: 25, color: "#00ff88" }); }} style={{
            width: "100%", background: "none", border: "1px solid #222", color: "#666",
            borderRadius: 6, padding: "8px 0", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12, marginTop: 8,
          }}>Cancel</button>
        )}
      </div>
    </div>
  );
}

// ─── AB TESTING ───────────────────────────────────────────────────────────────

async function callClaude(prompt, systemPrompt, model) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: systemPrompt || undefined,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "";
}

async function scoreOutput(output, prompt, rubric) {
  const scoringPrompt = `You are an expert AI output evaluator. Score the following AI response on this criterion:

Criterion: ${rubric.name}
Description: ${rubric.description}

Original Prompt: ${prompt}

AI Response:
${output}

Score this response from 0-100 on the criterion. Return ONLY a JSON object like:
{"score": 85, "reasoning": "Brief 1-2 sentence explanation"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: scoringPrompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text || "{}";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { score: null, reasoning: "Parse error" };
  }
}

function ABTest({ rubrics, addEvalRun }) {
  const [variants, setVariants] = useState([
    { id: "a", label: "Variant A", systemPrompt: "", model: ANTHROPIC_MODELS[0].id, output: null, scores: {}, loading: false, error: null },
    { id: "b", label: "Variant B", systemPrompt: "", model: ANTHROPIC_MODELS[1].id, output: null, scores: {}, loading: false, error: null },
  ]);
  const [userPrompt, setUserPrompt] = useState("");
  const [runName, setRunName] = useState("");
  const [scoring, setScoring] = useState(false);

  const updateVariant = (id, patch) => setVariants(v => v.map(x => x.id === id ? { ...x, ...patch } : x));

  const runAll = async () => {
    if (!userPrompt.trim()) return;
    for (const v of variants) {
      updateVariant(v.id, { loading: true, output: null, scores: {}, error: null });
      try {
        const output = await callClaude(userPrompt, v.systemPrompt, v.model);
        updateVariant(v.id, { output, loading: false });
      } catch (e) {
        updateVariant(v.id, { error: e.message, loading: false });
      }
    }
  };

  const scoreAll = async () => {
    if (rubrics.length === 0) return;
    setScoring(true);
    const updated = [...variants];
    for (let i = 0; i < updated.length; i++) {
      const v = updated[i];
      if (!v.output) continue;
      const scores = {};
      for (const r of rubrics) {
        const result = await scoreOutput(v.output, userPrompt, r);
        scores[r.id] = result;
        updated[i] = { ...updated[i], scores: { ...scores } };
        setVariants([...updated]);
      }
    }
    setScoring(false);

    // Save to history
    const evalRun = {
      id: genId(),
      name: runName || `Run · ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      prompt: userPrompt,
      variants: updated.map(v => ({
        label: v.label,
        model: v.model,
        systemPrompt: v.systemPrompt,
        output: v.output,
        scores: v.scores,
        weightedScore: computeWeighted(v.scores, rubrics),
      })),
      rubrics: rubrics.map(r => ({ ...r })),
    };
    addEvalRun(evalRun);
  };

  const computeWeighted = (scores, rubs) => {
    const total = rubs.reduce((s, r) => s + r.weight, 0);
    if (total === 0) return null;
    let weighted = 0;
    for (const r of rubs) {
      const s = scores[r.id]?.score;
      if (s != null) weighted += (s * r.weight) / total;
    }
    return Math.round(weighted);
  };

  const allHaveOutput = variants.every(v => v.output);

  return (
    <div>
      {/* Config row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>User Prompt</label>
          <textarea
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            placeholder="Enter the prompt to test across variants..."
            rows={3}
            style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "12px 14px", color: "#e8e8e8", fontFamily: "'DM Mono', monospace", fontSize: 13, resize: "vertical", boxSizing: "border-box", outline: "none" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Run Name</label>
          <input
            value={runName}
            onChange={e => setRunName(e.target.value)}
            placeholder="Optional label..."
            style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "12px 14px", color: "#e8e8e8", fontFamily: "'DM Mono', monospace", fontSize: 13, boxSizing: "border-box", outline: "none" }}
          />
        </div>
      </div>

      {/* Variant panels */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${variants.length}, 1fr)`, gap: 16, marginBottom: 20 }}>
        {variants.map(v => (
          <div key={v.id} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <input
                value={v.label}
                onChange={e => updateVariant(v.id, { label: e.target.value })}
                style={{ background: "none", border: "none", color: "#e8e8e8", fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, outline: "none", width: 120 }}
              />
              <select
                value={v.model}
                onChange={e => updateVariant(v.id, { model: e.target.value })}
                style={{ background: "#111", border: "1px solid #2a2a2a", color: "#888", borderRadius: 6, padding: "4px 8px", fontFamily: "'DM Mono', monospace", fontSize: 11, outline: "none" }}
              >
                {ANTHROPIC_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>

            <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>System Prompt</label>
            <textarea
              value={v.systemPrompt}
              onChange={e => updateVariant(v.id, { systemPrompt: e.target.value })}
              placeholder="Optional system prompt..."
              rows={3}
              style={{ width: "100%", background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, padding: "10px 12px", color: "#ccc", fontFamily: "'DM Mono', monospace", fontSize: 12, resize: "vertical", boxSizing: "border-box", outline: "none", marginBottom: 14 }}
            />

            {/* Output */}
            <div style={{ minHeight: 120, background: "#080808", border: "1px solid #1a1a1a", borderRadius: 6, padding: 12 }}>
              {v.loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                  <Spinner /> generating...
                </div>
              ) : v.error ? (
                <div style={{ color: "#ff4444", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{v.error}</div>
              ) : v.output ? (
                <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{v.output}</div>
              ) : (
                <div style={{ color: "#333", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>Output will appear here...</div>
              )}
            </div>

            {/* Scores */}
            {Object.keys(v.scores).length > 0 && (
              <div style={{ marginTop: 14 }}>
                {rubrics.map(r => {
                  const s = v.scores[r.id];
                  return s ? (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: r.color }}>{r.name}</span>
                      <ScoreBadge score={s.score} />
                    </div>
                  ) : null;
                })}
                <div style={{ borderTop: "1px solid #222", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", textTransform: "uppercase" }}>Weighted</span>
                  <ScoreBadge score={computeWeighted(v.scores, rubrics)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={runAll} disabled={!userPrompt.trim() || variants.some(v => v.loading)}
          style={{
            flex: 1, background: "#0a1a10", border: "1px solid #00ff8840", color: "#00ff88",
            borderRadius: 8, padding: "12px 0", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
          }}>
          ▶ Run All Variants
        </button>
        <button onClick={scoreAll} disabled={!allHaveOutput || rubrics.length === 0 || scoring}
          style={{
            flex: 1, background: "#0a0f1a", border: "1px solid #00d4ff40", color: "#00d4ff",
            borderRadius: 8, padding: "12px 0", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
            opacity: (!allHaveOutput || rubrics.length === 0) ? 0.4 : 1,
          }}>
          {scoring ? <span style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}><Spinner /> Scoring...</span> : "◈ Score & Save Run"}
        </button>
        <button onClick={() => setVariants(v => [...v, {
          id: genId(), label: `Variant ${String.fromCharCode(65 + v.length)}`,
          systemPrompt: "", model: ANTHROPIC_MODELS[0].id, output: null, scores: {}, loading: false, error: null,
        }])} style={{
          background: "#111", border: "1px solid #2a2a2a", color: "#666",
          borderRadius: 8, padding: "12px 18px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 13,
        }}>+ Variant</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function MiniBar({ value, max, color }) {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 3, height: 6, overflow: "hidden", flex: 1 }}>
      <div style={{ width: `${(value / max) * 100}%`, background: color, height: "100%", borderRadius: 3, transition: "width 0.6s ease" }} />
    </div>
  );
}

function Dashboard({ evalRuns, rubrics }) {
  if (evalRuns.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#444", fontFamily: "'DM Mono', monospace" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
        <div style={{ fontSize: 14, marginBottom: 8 }}>No eval runs yet</div>
        <div style={{ fontSize: 12, color: "#333" }}>Run & score variants in A/B Test to populate the dashboard</div>
      </div>
    );
  }

  const allVariants = evalRuns.flatMap(run =>
    run.variants.map(v => ({ ...v, runName: run.name, runId: run.id, timestamp: run.timestamp }))
  );

  // Best and worst
  const ranked = allVariants.filter(v => v.weightedScore !== null).sort((a, b) => b.weightedScore - a.weightedScore);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Runs", value: evalRuns.length, color: "#00ff88" },
          { label: "Variants Tested", value: allVariants.length, color: "#00d4ff" },
          { label: "Best Score", value: best ? best.weightedScore : "—", color: "#00ff88" },
          { label: "Avg Score", value: ranked.length ? Math.round(ranked.reduce((s, v) => s + v.weightedScore, 0) / ranked.length) : "—", color: "#ff9500" },
        ].map(s => (
          <div key={s.label} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Eval runs timeline */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>Eval History</div>

      {[...evalRuns].reverse().map(run => {
        const runRubrics = run.rubrics || rubrics;
        return (
          <div key={run.id} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 20, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#e8e8e8", marginBottom: 4 }}>{run.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#444" }}>
                  {new Date(run.timestamp).toLocaleString()} · {run.variants.length} variants
                </div>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555", maxWidth: 300, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {run.prompt}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${run.variants.length}, 1fr)`, gap: 12 }}>
              {run.variants.map((v, i) => (
                <div key={i} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>{v.label}</span>
                    <ScoreBadge score={v.weightedScore} />
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", marginBottom: 10 }}>
                    {ANTHROPIC_MODELS.find(m => m.id === v.model)?.label || v.model}
                  </div>
                  {runRubrics.map(r => {
                    const s = v.scores?.[r.id];
                    return s ? (
                      <div key={r.id} style={{ marginBottom: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: r.color }}>{r.name}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#666" }}>{s.score}</span>
                        </div>
                        <MiniBar value={s.score} max={100} color={r.color} />
                        {s.reasoning && (
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", marginTop: 3, lineHeight: 1.4 }}>
                            {s.reasoning.slice(0, 80)}{s.reasoning.length > 80 ? "..." : ""}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function EvalStudio() {
  const [tab, setTab] = useState("ab");
  const [rubrics, setRubrics] = useState(DEFAULT_RUBRICS);
  const [evalRuns, setEvalRuns] = useState([]);

  const addEvalRun = (run) => setEvalRuns(r => [...r, run]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#e8e8e8",
      fontFamily: "system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d0d0d; } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        textarea, input, select { transition: border-color 0.2s; }
        textarea:focus, input:focus, select:focus { border-color: #00ff8840 !important; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #181818",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#080808",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #00ff88, #00d4ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900,
          }}>◈</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: "#fff" }}>
              Eval Studio
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase" }}>
              AI Prompt Evaluation Platform
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff88", animation: "pulse 2s ease infinite" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#444" }}>Connected · Claude API</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #181818", padding: "0 40px", display: "flex", gap: 0 }}>
        <Tab label="A/B Test" active={tab === "ab"} onClick={() => setTab("ab")} />
        <Tab label="Rubrics" active={tab === "rubrics"} onClick={() => setTab("rubrics")} badge={rubrics.length} />
        <Tab label="Dashboard" active={tab === "dash"} onClick={() => setTab("dash")} badge={evalRuns.length} />
      </div>

      {/* Content */}
      <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {tab === "ab" && <ABTest rubrics={rubrics} addEvalRun={addEvalRun} />}
        {tab === "rubrics" && <RubricBuilder rubrics={rubrics} setRubrics={setRubrics} />}
        {tab === "dash" && <Dashboard evalRuns={evalRuns} rubrics={rubrics} />}
      </div>
    </div>
  );
}
