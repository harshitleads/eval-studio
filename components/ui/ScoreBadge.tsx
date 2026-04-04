"use client";

type ScoreBadgeProps = {
  score: number | null;
  size?: 'sm' | 'md';
};

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <span className="font-mono" style={{ fontSize: size === 'sm' ? 13 : 14, color: "var(--text-muted)" }}>
        --
      </span>
    );
  }

  const color =
    score >= 80
      ? 'var(--green)'
      : score >= 60
        ? 'var(--amber)'
        : 'var(--red)';

  return (
    <span
      className="font-mono font-bold rounded-[6px] inline-flex items-center justify-center"
      style={{
        fontSize: size === 'sm' ? 13 : 14,
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        padding: size === 'sm' ? '1px 6px' : '2px 8px',
      }}
    >
      {Math.round(score)}
    </span>
  );
}
