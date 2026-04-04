"use client";

import { PROVIDERS, PRICING_LAST_UPDATED } from "@/lib/providers";
import type { EvalResult, Config, JudgeConfig } from "@/types";

type AggregateSummaryProps = {
  results: EvalResult[];
  configs: Config[];
  judge1: JudgeConfig;
  judge2: JudgeConfig | null;
};

export default function AggregateSummary({ results, configs, judge1, judge2 }: AggregateSummaryProps) {
  const validResults = results.filter((r) => r.error === undefined);
  const errors = results.filter((r) => r.error !== undefined).length;

  const configStats = configs.map((c) => {
    let totalScore = 0;
    let count = 0;
    let firstPlaceWins = 0;
    let secondPlaceWins = 0;
    let totalTokens = 0;
    let totalCost = 0;

    for (const r of validResults) {
      const co = r.configOutputs.find(o => o.configId === c.id);
      if (co) {
        totalScore += co.councilScore;
        count++;
        if (co.rank === 1) firstPlaceWins++;
        if (co.rank === 2) secondPlaceWins++;
        totalTokens += co.inputTokens + co.outputTokens;
        totalCost += co.cost;
      }
    }

    return {
      configId: c.id,
      label: c.label,
      avgScore: count > 0 ? Math.round(totalScore / count) : 0,
      firstPlaceWins,
      secondPlaceWins,
      totalTokens,
      totalCost,
      avgCostPerRow: count > 0 ? totalCost / count : 0,
    };
  });

  const ranked = [...configStats].sort((a, b) => b.avgScore - a.avgScore);

  const j1Label = PROVIDERS[judge1.provider].models.find(m => m.id === judge1.model)?.label ?? judge1.model;
  const j2Label = judge2 ? PROVIDERS[judge2.provider].models.find(m => m.id === judge2.model)?.label ?? judge2.model : null;

  const hasBias = results.some(r => r.councilResult?.biasWarning);

  const exportCSV = () => {
    const configHeaders = configs.flatMap(c => [`${c.label} Output`, `${c.label} Score`, `${c.label} Rank`, `${c.label} Tokens`, `${c.label} Cost`]);
    const headers = ["#", "Input", ...configHeaders, "Winner", "Outlier", "Error"];

    const csvRows = results.map((r) => {
      const configCols = configs.flatMap(c => {
        const co = r.configOutputs.find(o => o.configId === c.id);
        return [
          co ? `"${co.output.replace(/"/g, '""')}"` : "",
          co?.councilScore ?? "",
          co?.rank ?? "",
          co ? co.inputTokens + co.outputTokens : "",
          co ? co.cost.toFixed(6) : "",
        ];
      });
      return [
        r.rowIndex + 1,
        `"${r.input.replace(/"/g, '""')}"`,
        ...configCols,
        r.winner,
        r.outlierDetected ? "Yes" : "",
        r.error ? `"${r.error.replace(/"/g, '""')}"` : "",
      ];
    });

    const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eval-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const thStyle = { background: "var(--card)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" };

  return (
    <div className="rounded-[10px] p-6 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="font-display text-[18px] font-bold mb-6" style={{ color: "var(--text)" }}>
        Overall Ranking
      </div>

      {/* Leaderboard table */}
      <div className="rounded-[10px] overflow-hidden mb-6" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Rank", "Config", "Avg Council Score", "1st Place Wins", "Total Rows"].map(h => (
                <th key={h} className="text-left text-[13px] font-semibold font-body px-4 py-3" style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((s, i) => (
              <tr key={s.configId}>
                <td className="font-mono text-[14px] font-bold px-4 py-3" style={{ color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
                  #{i + 1}
                </td>
                <td className="text-[14px] font-body font-medium px-4 py-3" style={{ color: "var(--text)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>{s.label}</td>
                <td className="font-mono text-[14px] font-bold px-4 py-3" style={{ color: s.avgScore >= 80 ? "var(--green)" : s.avgScore >= 60 ? "var(--amber)" : "var(--red)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>{s.avgScore}</td>
                <td className="font-mono text-[14px] px-4 py-3" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>{s.firstPlaceWins}</td>
                <td className="font-mono text-[14px] px-4 py-3" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>{validResults.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cost Summary */}
      <div className="font-display text-[18px] font-bold mb-4" style={{ color: "var(--text)" }}>
        Cost Summary
      </div>
      <div className="rounded-[10px] overflow-hidden mb-6" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Config", "Total Tokens", "Total Cost", "Avg Cost/Row"].map(h => (
                <th key={h} className="text-left text-[13px] font-semibold font-body px-4 py-3" style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configStats.map(s => (
              <tr key={s.configId}>
                <td className="text-[14px] font-body font-medium px-4 py-3" style={{ color: "var(--text)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>{s.label}</td>
                <td className="font-mono text-[14px] px-4 py-3" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>{s.totalTokens.toLocaleString()}</td>
                <td className="font-mono text-[14px] px-4 py-3" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>${s.totalCost.toFixed(4)}</td>
                <td className="font-mono text-[14px] px-4 py-3" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>${s.avgCostPerRow.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-3">
        <div className="rounded-[10px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>Judge Council</div>
          {j2Label ? (
            <div className="text-[14px] font-body" style={{ color: "var(--text)" }}>{j1Label} + {j2Label}</div>
          ) : (
            <div>
              <div className="text-[14px] font-body" style={{ color: "var(--text)" }}>{j1Label}</div>
              <div className="text-[13px] font-body mt-1 rounded-[6px] px-2 py-0.5 inline-block" style={{ color: "var(--amber)", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)" }}>Single judge mode</div>
            </div>
          )}
        </div>
        <div className="rounded-[10px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>Errors</div>
          <div className="font-mono text-lg font-bold" style={{ color: errors > 0 ? "var(--red)" : "var(--green)" }}>{errors}</div>
          <div className="text-[13px] font-body" style={{ color: "var(--text-muted)" }}>of {results.length} rows</div>
        </div>
        {hasBias && (
          <div className="rounded-[10px] p-4" style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <div className="text-[13px] font-semibold font-body mb-2" style={{ color: "var(--amber)" }}>Bias Warning</div>
            <div className="text-[13px] font-body" style={{ color: "var(--amber)" }}>Judge provider overlaps with config provider.</div>
          </div>
        )}
      </div>

      <p className="text-[13px] font-body mb-4" style={{ color: "var(--text-muted)" }}>
        Prices from provider documentation. Last updated: {PRICING_LAST_UPDATED}.
      </p>

      <button onClick={exportCSV} className="w-full text-[15px] font-semibold font-body py-3.5 rounded-[8px] cursor-pointer" style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", color: "var(--blue)" }}>
        Export CSV
      </button>
    </div>
  );
}
