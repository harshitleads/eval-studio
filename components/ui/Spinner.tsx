"use client";

interface SpinnerProps {
  size?: number;
}

export default function Spinner({ size = 14 }: SpinnerProps) {
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        border: "2px solid var(--border-interactive)",
        borderTopColor: "var(--green)",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
