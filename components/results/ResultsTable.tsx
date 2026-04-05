"use client";

import type { EvalResult, Config } from "@/types";
import ScoreBadge from "@/components/ui/ScoreBadge";
import { PRICING_LAST_UPDATED } from "@/lib/providers";

type ResultsTableProps = {
  results: EvalResult[];
  configs: Config[];
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

const RANK_COLORS: Record<number, string> = { 1: "#ffd700", 2: "#c0c0c0", 3: "#cd7f32", 4: "#666666" };

function RankBadge({ rank }: { rank: number }) {
  const color = RANK_COLORS[rank] ?? "#666666";
  const labels: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };
  return (
    <span className="font-mono text-[13px] font-bold rounded-[6px] px-2 py-0.5 inline-block" style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}>
      {labels[rank] ?? `${rank}th`}
    </span>
  );
}

export default function ResultsTable({ results, configs }: ResultsTableProps) {
  const tdStyle = { borderBottom: "1px solid var(--border)", background: "var(--card)" };
  const thStyle = { background: "var(--surface)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" as const };

  return (
    <div className="rounded-[10px] overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-[13px] font-semibold font-body px-3 py-3" style={thStyle}>#</th>
            <th className="text-left text-[13px] font-semibold font-body px-3 py-3" style={thStyle}>Input</th>
            {configs.map((c) => (
              <th key={c.id} className="text-left text-[13px] font-semibold font-body px-3 py-3" style={thStyle}>{c.label}</th>
            ))}
            <th className="text-left text-[13px] font-semibold font-body px-3 py-3" style={thStyle}>Ranking</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.rowIndex}>
              <td className="font-mono text-[14px] px-3 py-3" style={{ ...tdStyle, color: "var(--text-muted)" }}>{r.rowIndex + 1}</td>
              <td className="font-mono text-[14px] px-3 py-3 max-w-[200px]" style={{ ...tdStyle, color: "var(--text-secondary)" }} title={r.input}>
                {truncate(r.input, 80)}
              </td>
              {configs.map((c) => {
                const co = r.configOutputs.find(o => o.configId === c.id);
                return (
                  <td key={c.id} className="px-3 py-3 max-w-[240px]" style={tdStyle}>
                    {co ? (
                      <div>
                        <div className="font-mono text-[13px] mb-1.5" style={{ color: "var(--text-secondary)" }} title={co.output}>
                          {truncate(co.output, 120)}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <ScoreBadge score={co.councilScore} size="sm" />
                        </div>
                        <div className="font-mono text-[13px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                          {(co.inputTokens + co.outputTokens).toLocaleString()} tokens &middot; ${co.cost.toFixed(4)}
                          <span
                            className="cursor-help inline-flex items-center justify-center rounded-full text-[10px] font-body font-bold"
                            style={{ width: 14, height: 14, background: "var(--border)", color: "var(--text-muted)" }}
                            title={`Based on published pricing as of ${PRICING_LAST_UPDATED}`}
                          >
                            i
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>--</span>
                    )}
                  </td>
                );
              })}
              <td className="px-3 py-3" style={tdStyle}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {r.configOutputs.length > 0 ? (
                    [...r.configOutputs].sort((a, b) => a.rank - b.rank).map(co => (
                      <div key={co.configId} className="flex items-center gap-1">
                        <RankBadge rank={co.rank} />
                        <span className="font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>{co.configLabel}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[14px] font-body" style={{ color: "var(--red)" }}>Error</span>
                  )}
                  {r.outlierDetected && (
                    <span className="cursor-help text-[14px] ml-1" title="Judges disagreed significantly on this row." style={{ color: "var(--amber)" }}>&#9888;</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
