"use client";

type TabProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
};

export default function Tab({ label, active, onClick, badge }: TabProps) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border-none cursor-pointer px-5 py-2.5 text-[14px] font-body font-medium transition-all relative"
      style={{
        color: active ? "var(--green)" : "var(--text-muted)",
        borderBottom: active ? "2px solid var(--green)" : "2px solid transparent",
      }}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-1.5 rounded-full text-[13px] px-1.5 py-px font-bold font-mono"
          style={{
            background: "rgba(0, 232, 122, 0.19)",
            color: "var(--green)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
