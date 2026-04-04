"use client";

import { useCallback, useEffect, useState } from "react";
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

function KeyFixInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-[8px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <label className="block text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      <div className="flex gap-2 mb-1">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-[15px] font-body rounded-[8px] px-4 py-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}
        />
        <button
          onClick={() => setShow(!show)}
          className="text-[14px] font-body px-4 rounded-[8px] cursor-pointer"
          style={{ background: "var(--surface)", border: "1px solid var(--border-interactive)", color: "var(--text-secondary)" }}
        >
          {show ? "hide" : "show"}
        </button>
      </div>
      <p className="text-[13px] font-body" style={{ color: "var(--text-muted)" }}>
        Leave empty if not using this provider
      </p>
    </div>
  );
}

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
  const [localKeys, setLocalKeys] = useState<ProviderKeys>(providerKeys);
  const [showKeyFix, setShowKeyFix] = useState(false);
  const [running, setRunning] = useState(false);

  const configProviders: Provider[] = configs.map(c => c.provider);

  const runEvalFn = useCallback(async (keys: ProviderKeys) => {
    setResults([]);
    setDone(false);
    setShowKeyFix(false);
    setCurrentRow(0);
    setRunning(true);

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
            keys
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
          keys,
          configProviders
        );

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
    setRunning(false);
    onComplete(accumulated);

    const errorCount = accumulated.filter(r => r.winner === "Error").length;
    if (errorCount / accumulated.length >= 0.5) {
      setShowKeyFix(true);
    }
  }, [rows, configs, rubric, judge1, judge2, configProviders, onComplete]);

  useEffect(() => {
    runEvalFn(localKeys);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    runEvalFn(localKeys);
  };

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

      {/* Progress bar */}
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

      {/* Key-fix panel */}
      {done && showKeyFix && (
        <div
          className="rounded-[10px] p-6 mb-6 relative"
          style={{ background: "rgba(248, 113, 113, 0.05)", border: "1px solid rgba(248, 113, 113, 0.25)" }}
        >
          <button
            onClick={() => setShowKeyFix(false)}
            className="absolute top-4 right-4 cursor-pointer bg-transparent border-none text-[16px]"
            style={{ color: "var(--text-muted)" }}
          >
            x
          </button>

          <div className="font-display text-[18px] font-bold mb-2" style={{ color: "var(--red)" }}>
            API calls failed
          </div>
          <p className="text-[14px] font-body mb-5" style={{ color: "var(--text-secondary)" }}>
            More than half of rows returned errors. This usually means an API key is missing or invalid. Update your keys below and retry.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            <KeyFixInput
              label="Anthropic API Key"
              value={localKeys.anthropic}
              onChange={(v) => setLocalKeys({ ...localKeys, anthropic: v })}
              placeholder="sk-ant-..."
            />
            <KeyFixInput
              label="OpenAI API Key"
              value={localKeys.openai}
              onChange={(v) => setLocalKeys({ ...localKeys, openai: v })}
              placeholder="sk-..."
            />
            <KeyFixInput
              label="Google Gemini API Key"
              value={localKeys.gemini}
              onChange={(v) => setLocalKeys({ ...localKeys, gemini: v })}
              placeholder="AIza..."
            />
          </div>

          <button
            onClick={handleRetry}
            disabled={running}
            className="w-full text-[15px] font-semibold font-body py-3.5 rounded-[8px] cursor-pointer transition-opacity"
            style={{ background: "rgba(0, 232, 122, 0.1)", border: "1px solid rgba(0, 232, 122, 0.3)", color: "var(--green)" }}
          >
            Retry with updated keys
          </button>
        </div>
      )}

      {done && results.length > 0 && (
        <AggregateSummary results={results} configs={configs} judge1={judge1} judge2={judge2} />
      )}

      {results.length > 0 && (
        <ResultsTable results={results} configs={configs} />
      )}
    </div>
  );
}
