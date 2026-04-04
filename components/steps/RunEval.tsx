"use client";

import { useEffect, useRef, useState } from "react";
import type { Config, RubricCriterion, EvalResult, Row, JudgeConfig, ProviderKeys, Provider, ConfigOutput } from "@/types";
import { callModel } from "@/lib/callModel";
import { computeCost } from "@/lib/providers";
import { judgeCouncil } from "@/lib/judge";
import { exactMatch } from "@/lib/scorer";
import Spinner from "@/components/ui/Spinner";
import ResultsTable from "@/components/results/ResultsTable";
import AggregateSummary from "@/components/results/AggregateSummary";

type RunEvalProps = {
  rows: Row[];
  configs: Config[];
  rubric: RubricCriterion[];
  judge1: JudgeConfig;
  judge2: JudgeConfig | null;
  providerKeys: ProviderKeys;
  onComplete: (results: EvalResult[]) => void;
};

export default function RunEval({
  rows,
  configs,
  rubric,
  judge1,
  judge2,
  providerKeys,
  onComplete,
}: RunEvalProps) {
  const [results, setResults] = useState<EvalResult[]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [done, setDone] = useState(false);
  const [showBiasWarning, setShowBiasWarning] = useState(false);
  const started = useRef(false);

  const configProviders: Provider[] = configs.map(c => c.provider);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      const accumulated: EvalResult[] = [];

      for (let i = 0; i < rows.length; i++) {
        setCurrentRow(i + 1);
        const row = rows[i];

        const result: EvalResult = {
          rowIndex: i,
          input: row.input,
          configOutputs: [],
          winner: "Error",
        };

        try {
          const outputs: { configId: string; configLabel: string; output: string; inputTokens: number; outputTokens: number; cost: number }[] = [];
          for (const config of configs) {
            const { text, inputTokens, outputTokens } = await callModel(
              row.input,
              config.systemPrompt,
              config.provider,
              config.model,
              providerKeys
            );
            const cost = computeCost(config.model, inputTokens, outputTokens);
            outputs.push({ configId: config.id, configLabel: config.label, output: text, inputTokens, outputTokens, cost });
          }

          const council = await judgeCouncil(
            row.input,
            outputs,
            rubric,
            judge1,
            judge2,
            providerKeys,
            configProviders
          );

          // Merge token/cost data from generation calls into council outputs
          const configOutputs: ConfigOutput[] = council.configOutputs.map(co => {
            const genData = outputs.find(o => o.configId === co.configId);
            const em = row.expectedOutput ? exactMatch(row.expectedOutput, co.output) : undefined;
            return {
              ...co,
              exactMatch: em,
              inputTokens: genData?.inputTokens ?? 0,
              outputTokens: genData?.outputTokens ?? 0,
              cost: genData?.cost ?? 0,
            };
          });

          result.configOutputs = configOutputs;
          result.councilResult = { ...council, configOutputs };
          result.outlierDetected = council.outlierDetected;
          result.winner = council.rankedConfigIds[0] ?? "Error";

          if (council.biasWarning) setShowBiasWarning(true);
        } catch (err) {
          result.error = err instanceof Error ? err.message : "Unknown error";
          result.winner = "Error";
        }

        accumulated.push(result);
        setResults([...accumulated]);
      }

      setDone(true);
      onComplete(accumulated);
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-[1400px] mx-auto">
      {showBiasWarning && (
        <div
          className="text-[14px] font-body p-4 rounded-[8px] mb-4 flex justify-between items-start"
          style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "var(--amber)" }}
        >
          <span>
            Warning: One or more judges share a provider with a config being tested.
            This may introduce bias. For most accurate results, use judges from different providers than your configs.
          </span>
          <button onClick={() => setShowBiasWarning(false)} className="ml-3 shrink-0 cursor-pointer bg-transparent border-none text-[16px]" style={{ color: "var(--amber)" }}>x</button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {!done && <Spinner />}
            <span className="text-[14px] font-body" style={{ color: done ? "var(--green)" : "var(--text-secondary)" }}>
              {done ? "Evaluation complete" : `Processing row ${currentRow} of ${rows.length}`}
            </span>
          </div>
          <span className="font-mono text-[14px]" style={{ color: "var(--text-muted)" }}>
            {results.length} / {rows.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(results.length / rows.length) * 100}%`, background: done ? "var(--green)" : "var(--blue)" }} />
        </div>
      </div>

      {done && results.length > 0 && (
        <AggregateSummary results={results} configs={configs} judge1={judge1} judge2={judge2} />
      )}

      {results.length > 0 && (
        <ResultsTable results={results} configs={configs} />
      )}
    </div>
  );
}
