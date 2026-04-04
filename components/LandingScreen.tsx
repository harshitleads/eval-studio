"use client";

type LandingScreenProps = {
  onStart: () => void;
};

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-10 py-16 max-w-[1000px] mx-auto w-full">
        {/* Headline */}
        <div className="text-center mb-12">
          <h1 className="font-display text-[36px] font-bold mb-4" style={{ color: "var(--text)" }}>
            Eval Studio
          </h1>
          <p className="text-[16px] font-body leading-relaxed max-w-[640px] mx-auto" style={{ color: "var(--text-secondary)" }}>
            Your data. Your prompts. Your models. Real answers.
          </p>
          <p className="text-[16px] font-body leading-relaxed max-w-[640px] mx-auto mt-3" style={{ color: "var(--text-muted)" }}>
            Not a benchmark. Not a leaderboard. An eval tool for the question every AI team actually faces: which prompt, which model, at what cost?
          </p>
        </div>

        {/* Two cards */}
        <div className="grid grid-cols-2 gap-6 w-full mb-12">
          {/* Test Models */}
          <div
            className="rounded-[10px] p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="text-[28px] mb-4" style={{ color: "var(--blue)" }}>&#9638;&#9638;</div>
            <h2 className="font-display text-[20px] font-bold mb-3" style={{ color: "var(--text)" }}>
              Test Models
            </h2>
            <p className="text-[15px] font-body leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Same prompt. Different models. Upload your dataset, define one system prompt, pick 2-4 models. See which model serves your data best - and at what cost.
            </p>
          </div>

          {/* Test Prompts */}
          <div
            className="rounded-[10px] p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="text-[28px] mb-4" style={{ color: "var(--green)" }}>&#9998;</div>
            <h2 className="font-display text-[20px] font-bold mb-3" style={{ color: "var(--text)" }}>
              Test Prompts
            </h2>
            <p className="text-[15px] font-body leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Same model. Different prompts. Upload your dataset, pick one model, write 2-4 system prompts. See which prompt produces better outputs - on your actual data.
            </p>
          </div>
        </div>

        {/* 3-step instruction strip */}
        <div className="flex items-start gap-8 mb-12 w-full justify-center">
          {[
            { num: 1, text: "Upload your dataset (CSV, max 50 rows)" },
            { num: 2, text: "Configure your prompts and models" },
            { num: 3, text: "Run the eval and see ranked results with cost breakdown" },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3 max-w-[280px]">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono text-[14px] font-bold"
                style={{
                  background: "rgba(0, 232, 122, 0.1)",
                  border: "1px solid rgba(0, 232, 122, 0.25)",
                  color: "var(--green)",
                }}
              >
                {step.num}
              </div>
              <p className="text-[14px] font-body" style={{ color: "var(--text-muted)" }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full max-w-[480px] text-[16px] font-semibold font-body py-4 rounded-[8px] cursor-pointer transition-opacity"
          style={{
            background: "rgba(0, 232, 122, 0.1)",
            border: "1px solid rgba(0, 232, 122, 0.3)",
            color: "var(--green)",
          }}
        >
          Start Eval
        </button>
      </div>
    </div>
  );
}
