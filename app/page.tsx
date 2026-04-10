"use client";

import { useState, useMemo } from "react";
import type { Config, RubricCriterion, EvalResult, Row, ProviderKeys, JudgeConfig, Provider } from "@/types";
import Tab from "@/components/ui/Tab";
import LandingScreen from "@/components/LandingScreen";
import KeyEntry from "@/components/steps/KeyEntry";
import DatasetUpload from "@/components/steps/DatasetUpload";
import ConfigBuilder from "@/components/steps/ConfigBuilder";
import RubricBuilder from "@/components/steps/RubricBuilder";
import RunEval from "@/components/steps/RunEval";
import CaseStudyBubble from "@/components/CaseStudyBubble";

const STEP_LABELS = ["API Keys", "Dataset", "Configure", "Rubric", "Results"];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [maxReached, setMaxReached] = useState(-1);

  const [providerKeys, setProviderKeys] = useState<ProviderKeys>({ anthropic: "", openai: "", gemini: "" });
  const [rows, setRows] = useState<Row[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [rubric, setRubric] = useState<RubricCriterion[]>([]);
  const [judge1, setJudge1] = useState<JudgeConfig | null>(null);
  const [judge2, setJudge2] = useState<JudgeConfig | null>(null);
  const [evalResults, setEvalResults] = useState<EvalResult[]>([]);
  const [evalStarted, setEvalStarted] = useState(false);

  const configProviders: Provider[] = useMemo(() => configs.map(c => c.provider), [configs]);
  const connectedCount = [providerKeys.anthropic, providerKeys.openai, providerKeys.gemini].filter(k => k.trim() !== "").length;

  const goTo = (step: number) => {
    setCurrentStep(step);
    if (step > maxReached) setMaxReached(step);
  };

  // Landing screen
  if (currentStep === -1) {
    return (
      <>
        <LandingScreen onStart={() => goTo(0)} />
        <CaseStudyBubble />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-10 py-5"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-lg"
            style={{ background: "linear-gradient(135deg, #00e87a 0%, #38bdf8 100%)", color: "#0a0a0a", letterSpacing: "-1px" }}
          >
            ES
          </div>
          <div>
            <div className="font-display text-xl font-extrabold tracking-tight text-white">Eval Studio</div>
            <div className="text-[13px] font-body" style={{ color: "var(--text-secondary)" }}>AI Prompt Evaluation Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[14px] font-body" style={{ color: "var(--text-muted)" }}>
            Step {currentStep + 1} of {STEP_LABELS.length}
          </span>
          {connectedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-[7px] h-[7px] rounded-full" style={{ background: "var(--green)", animation: "pulse 2s ease infinite" }} />
              <span className="text-[14px] font-body" style={{ color: "var(--text-muted)" }}>
                {connectedCount} provider{connectedCount !== 1 ? "s" : ""} connected
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Step progress bar */}
      <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
        {STEP_LABELS.map((_, i) => (
          <div key={i} className="flex-1 h-[3px]" style={{ background: i <= currentStep ? "var(--green)" : "var(--border)", transition: "background 0.3s" }} />
        ))}
      </div>

      {/* Step tabs */}
      <nav className="flex px-10" style={{ borderBottom: "1px solid var(--border)" }}>
        {STEP_LABELS.map((label, i) => (
          <Tab key={label} label={`${i}. ${label}`} active={currentStep === i} onClick={() => { if (i <= maxReached && currentStep !== 4) goTo(i); }} />
        ))}
      </nav>

      {/* Back navigation */}
      {currentStep > 0 && currentStep < 4 && (
        <div className="px-10 pt-4">
          <button onClick={() => goTo(currentStep - 1)} className="text-[14px] font-body cursor-pointer bg-transparent border-none" style={{ color: "var(--text-muted)" }}>&larr; Back</button>
        </div>
      )}

      {/* Step content */}
      <main className="px-10 py-8 max-w-[1400px] mx-auto">
        <div style={{ display: currentStep === 0 ? "block" : "none" }}>
          <KeyEntry onConfirm={(keys) => { setProviderKeys(keys); goTo(1); }} />
        </div>
        <div style={{ display: currentStep === 1 ? "block" : "none" }}>
          <DatasetUpload onConfirm={(newRows) => { setRows(newRows); goTo(2); }} />
        </div>
        <div style={{ display: currentStep === 2 ? "block" : "none" }}>
          <ConfigBuilder providerKeys={providerKeys} onConfirm={(cfgs) => { setConfigs(cfgs); goTo(3); }} />
        </div>
        <div style={{ display: currentStep === 3 ? "block" : "none" }}>
          <RubricBuilder providerKeys={providerKeys} configProviders={configProviders} onConfirm={(r, j1, j2) => { setRubric(r); setJudge1(j1); setJudge2(j2); setEvalStarted(true); goTo(4); }} />
        </div>
        <div style={{ display: currentStep === 4 ? "block" : "none" }}>
          {evalStarted && judge1 && configs.length > 0 && rubric.length > 0 && (
            <RunEval rows={rows} configs={configs} rubric={rubric} judge1={judge1} judge2={judge2} providerKeys={providerKeys} onComplete={(r) => setEvalResults(r)} />
          )}
        </div>
      </main>
      <CaseStudyBubble />
    </div>
  );
}
