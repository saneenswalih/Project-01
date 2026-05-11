import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowUpCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import type { ReviewData } from "@/types/review";

interface Props {
  data: ReviewData;
  onReset: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  visual_design: "Visual Design",
  project_depth: "Project Depth",
  narrative: "Narrative",
  impact_metrics: "Impact Metrics",
};

const LIKELIHOOD_COLORS: Record<string, string> = {
  "very likely": "#22c55e",
  likely: "#84cc16",
  unlikely: "#f59e0b",
  "very unlikely": "#ef4444",
};

const PRIORITY_CONFIG = {
  high: { color: "#ef4444", label: "High" },
  medium: { color: "#f59e0b", label: "Medium" },
  low: { color: "#6366f1", label: "Low" },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "var(--primary)"
      : score >= 60
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" as const }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-4xl font-bold leading-none"
          style={{ color: "var(--foreground)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          / 100
        </span>
      </div>
    </div>
  );
}

export default function ReviewResults({ data, onReset }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const likelihoodColor =
    LIKELIHOOD_COLORS[data.shortlist_likelihood] ?? "var(--primary)";

  return (
    <motion.section
      ref={ref}
      id="review-results"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className="px-4 pb-24"
    >
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2
            className="font-display text-2xl sm:text-3xl"
            style={{ color: "var(--foreground)" }}
          >
            Your Portfolio Review
          </h2>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors duration-150"
            style={{
              background: "var(--muted)",
              color: "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }}
          >
            <RefreshCw size={13} />
            New review
          </button>
        </div>

        {/* Score + Summary */}
        <div className="glass rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Score panel */}
            <div
              className="p-8 flex flex-col items-center justify-center gap-5 border-b lg:border-b-0 lg:border-r"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                Overall Score
              </p>
              <ScoreRing score={data.overall_score} />

              {/* Shortlist badge */}
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: `${likelihoodColor}18`,
                  color: likelihoodColor,
                  border: `1px solid ${likelihoodColor}40`,
                }}
              >
                <TrendingUp size={13} />
                Shortlist: {data.shortlist_likelihood}
              </div>

              {/* Stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    fill={s <= data.shortlist_stars ? "var(--primary)" : "none"}
                    style={{ color: "var(--primary)" }}
                  />
                ))}
              </div>
            </div>

            {/* Summary + category scores */}
            <div className="p-8 flex flex-col gap-5">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Summary
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--foreground)" }}
                >
                  {data.summary}
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(data.category_scores).map(([key, val], i) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--muted-foreground)" }}>
                        {CATEGORY_LABELS[key] ?? key}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {val}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--muted)" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "var(--primary)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{
                          duration: 0.9,
                          delay: 0.3 + i * 0.08,
                          ease: "easeOut" as const,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter notes */}
        <div className="glass rounded-3xl p-6 sm:p-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            Recruiter Notes
          </p>
          <div className="space-y-3">
            <AnimatePresence>
              {data.recruiter_notes.map((note, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "var(--muted)" }}
                >
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--primary)" }}
                  />
                  <p
                    className="text-sm leading-snug"
                    style={{ color: "var(--foreground)" }}
                  >
                    {note}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass rounded-3xl p-6 sm:p-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            Recommendations
          </p>
          <div className="space-y-3">
            {data.recommendations.map((rec, i) => {
              const cfg = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG.medium;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="mt-0.5 shrink-0"
                    style={{ color: cfg.color }}
                  >
                    {rec.priority === "high" ? (
                      <AlertCircle size={17} />
                    ) : (
                      <ArrowUpCircle size={17} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {rec.title}
                      </p>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${cfg.color}18`,
                          color: cfg.color,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {rec.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
