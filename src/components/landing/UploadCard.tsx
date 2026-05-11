import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Link2,
  ChevronDown,
  Sparkles,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { ReviewData } from "@/types/review";

const REVIEW_TYPES = [
  "General Portfolio Review",
  "Software Engineering Role",
  "Product Design / UX",
  "Data Science & Analytics",
  "Product Management",
  "Frontend Engineering",
  "Backend Engineering",
  "DevOps / Platform Engineering",
  "Machine Learning Engineer",
  "Technical Program Manager",
  "Creative Direction",
];

interface Props {
  onReview: (data: ReviewData) => void;
}

export default function UploadCard({ onReview }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [reviewType, setReviewType] = useState(REVIEW_TYPES[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"file" | "url">("file");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setError(null); }
  }, []);

  async function handleGenerate() {
    if ((!file && !url.trim()) || loading) return;
    setLoading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("reviewType", reviewType);
      body.append("customPrompt", customPrompt);
      if (file) {
        body.append("file", file);
      } else {
        body.append("url", url.trim());
      }

      const res = await fetch("/api/review", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Review failed — please try again.");
      }

      onReview(data as ReviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = (file || url.trim()) && !loading;

  return (
    <section id="upload" className="relative px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: "easeOut" as const }}
        className="max-w-2xl mx-auto glass rounded-3xl p-6 sm:p-8"
      >
        {/* Card header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--glow-soft)", color: "var(--primary)" }}
          >
            <FileText size={18} />
          </div>
          <div>
            <h2
              className="font-display text-xl"
              style={{ color: "var(--foreground)" }}
            >
              Review your portfolio
            </h2>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Upload a file or paste a URL — Claude will do the rest
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 mb-5"
          style={{ background: "var(--muted)" }}
        >
          {(["file", "url"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                tab === t
                  ? {
                      background: "var(--background)",
                      color: "var(--foreground)",
                      boxShadow: "var(--shadow-soft)",
                    }
                  : { color: "var(--muted-foreground)" }
              }
            >
              {t === "file" ? <Upload size={14} /> : <Link2 size={14} />}
              {t === "file" ? "Upload file" : "Paste URL"}
            </button>
          ))}
        </div>

        {/* File drop zone */}
        {tab === "file" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 cursor-pointer transition-all duration-200"
            style={{
              borderColor: dragging ? "var(--primary)" : "var(--border)",
              background: dragging ? "var(--glow-soft)" : "var(--muted)",
              boxShadow: dragging ? "var(--shadow-glow)" : "none",
            }}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); setError(null); }
              }}
            />
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--glow-soft)", color: "var(--primary)" }}
            >
              <Upload size={20} />
            </div>
            {file ? (
              <div className="text-center">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {(file.size / 1024).toFixed(0)} KB · Click to change
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Drop your portfolio here
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  PDF, PNG, JPG, WEBP · up to 20 MB
                </p>
              </div>
            )}
          </div>
        )}

        {/* URL input */}
        {tab === "url" && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
          >
            <Link2 size={15} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); }}
              placeholder="https://yourportfolio.com"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
          </div>
        )}

        {/* Review type selector */}
        <div className="relative mt-4">
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Review type
          </label>
          <div className="relative">
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="w-full appearance-none rounded-xl px-4 py-3 text-sm pr-10 outline-none cursor-pointer"
              style={{
                background: "var(--muted)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              {REVIEW_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>
        </div>

        {/* Custom prompt */}
        <div className="mt-4">
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Custom prompt{" "}
            <span className="font-normal opacity-60">(optional)</span>
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Focus on storytelling and visual hierarchy for a senior design role at a fintech startup…"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{
              background: "var(--muted)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!canSubmit}
          className="glow-button animate-shimmer mt-5 w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Claude is reviewing your portfolio…
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Generate Review
            </>
          )}
        </button>

        {loading && (
          <p
            className="mt-3 text-center text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            This usually takes 15–30 seconds
          </p>
        )}
      </motion.div>
    </section>
  );
}
