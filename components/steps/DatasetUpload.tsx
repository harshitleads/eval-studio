"use client";

import { useRef, useState, useCallback } from "react";
import { parseCSV } from "@/lib/csv";
import type { Row } from "@/types";

type DatasetUploadProps = {
  onConfirm: (rows: Row[]) => void;
};

const MAX_ROWS = 50;

export default function DatasetUpload({ onConfirm }: DatasetUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [inputColumn, setInputColumn] = useState("");
  const [expectedColumn, setExpectedColumn] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setTruncated(false);

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }

    try {
      let parsed = await parseCSV(file);
      if (parsed.length === 0) {
        setError("CSV file is empty");
        return;
      }
      if (parsed.length > MAX_ROWS) {
        parsed = parsed.slice(0, MAX_ROWS);
        setTruncated(true);
      }
      const cols = Object.keys(parsed[0]);
      setRawRows(parsed);
      setColumns(cols);
      setInputColumn("");
      setExpectedColumn("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const loadSampleDataset = async () => {
    const res = await fetch('/golden-dataset.csv');
    const text = await res.text();
    const file = new File([text], 'golden-dataset.csv', { type: 'text/csv' });
    handleFile(file);
  };

  const handleConfirm = () => {
    const rows: Row[] = rawRows.map((r) => ({
      input: r[inputColumn] || "",
      expectedOutput: expectedColumn ? r[expectedColumn] : undefined,
    }));
    onConfirm(rows);
  };

  const previewRows = rawRows.slice(0, 5);
  const canContinue = rawRows.length > 0 && inputColumn !== "";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className="rounded-[10px] p-12 text-center cursor-pointer transition-all mb-3"
        style={{
          background: dragOver ? "rgba(0, 232, 122, 0.05)" : "var(--surface)",
          border: dragOver ? "2px dashed var(--green)" : "2px dashed var(--border-interactive)",
        }}
      >
        <div className="text-2xl mb-3 font-body" style={{ color: "var(--text-muted)" }}>&#8593;</div>
        <div className="text-[15px] font-body" style={{ color: "var(--text-secondary)" }}>
          Drop your CSV here, or click to browse
        </div>
        <div className="text-[14px] font-body mt-2" style={{ color: "var(--text-muted)" }}>
          Max {MAX_ROWS} rows. Headers required.
        </div>
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
      </div>

      {/* Sample dataset link */}
      <div className="text-center mb-6">
        <button
          onClick={loadSampleDataset}
          className="text-[14px] font-body underline bg-transparent border-none cursor-pointer"
          style={{ color: "var(--text-muted)" }}
        >
          Use sample dataset (50 rows, 8 task categories)
        </button>
      </div>

      {error && (
        <div className="text-[14px] font-body p-3 rounded-[8px] mb-4" style={{ background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.2)", color: "var(--red)" }}>
          {error}
        </div>
      )}

      {truncated && (
        <div className="text-[14px] font-body p-3 rounded-[8px] mb-4" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", color: "var(--amber)" }}>
          Dataset truncated to {MAX_ROWS} rows.
        </div>
      )}

      {rawRows.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold font-body" style={{ color: "var(--text-secondary)" }}>
              Preview ({rawRows.length} rows, showing first {previewRows.length})
            </span>
          </div>
          <div className="overflow-x-auto rounded-[10px] mb-6" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="text-left text-[13px] font-semibold font-body px-3 py-2.5" style={{ background: "var(--surface)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col} className="font-mono text-[14px] px-3 py-2.5 max-w-[200px] truncate" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>Input column</label>
              <select value={inputColumn} onChange={(e) => setInputColumn(e.target.value)} className="w-full text-[15px] font-body rounded-[8px] px-4 py-3" style={{ background: "var(--card)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}>
                <option value="">Select column...</option>
                {columns.map((col) => (<option key={col} value={col}>{col}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold font-body mb-2" style={{ color: "var(--text-secondary)" }}>Expected output column (optional)</label>
              <select value={expectedColumn} onChange={(e) => setExpectedColumn(e.target.value)} className="w-full text-[15px] font-body rounded-[8px] px-4 py-3" style={{ background: "var(--card)", border: "1px solid var(--border-interactive)", color: "var(--text)" }}>
                <option value="">None</option>
                {columns.map((col) => (<option key={col} value={col}>{col}</option>))}
              </select>
            </div>
          </div>
        </>
      )}

      <button onClick={handleConfirm} disabled={!canContinue} className="w-full text-[15px] font-semibold font-body py-3.5 rounded-[8px] cursor-pointer transition-opacity" style={{ background: "rgba(0, 232, 122, 0.08)", border: "1px solid rgba(0, 232, 122, 0.25)", color: "var(--green)" }}>
        Continue
      </button>
    </div>
  );
}
