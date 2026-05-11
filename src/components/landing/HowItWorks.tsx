import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Cpu, Eye, Lightbulb, Star, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    icon: <Upload size={20} />,
    number: "01",
    title: "Upload",
    description:
      "Drop your portfolio PDF, screenshot, or paste a live URL. Supports all major formats.",
  },
  {
    icon: <Cpu size={20} />,
    number: "02",
    title: "Analyze",
    description:
      "Our AI parses layout, narrative, project depth, impact metrics, and visual hierarchy.",
  },
  {
    icon: <Eye size={20} />,
    number: "03",
    title: "Simulate",
    description:
      "We simulate how a recruiter or hiring manager reads your portfolio in 6–10 seconds.",
  },
  {
    icon: <Lightbulb size={20} />,
    number: "04",
    title: "Insights",
    description:
      "Get a scored report with actionable suggestions, ranked by impact on your chances.",
  },
];

const RECRUITER_NOTES = [
  "Strong project impact metrics — quantified results stand out.",
  "Navigation is clean; recruiter eye lands on key projects immediately.",
  "Consider adding a brief bio above the fold for context.",
  "Case study depth is above average — narrative flows well.",
];

function ScoreRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
      <circle
        cx="54"
        cy="54"
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth="8"
      />
      <motion.circle
        cx="54"
        cy="54"
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        whileInView={{ strokeDashoffset: offset }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" as const }}
      />
    </svg>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      id="how-it-works"
      className="relative px-4 py-24 overflow-hidden"
    >
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ backgroundImage: "var(--gradient-glow)" }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--primary)" }}
          >
            How it works
          </p>
          <h2
            className="font-display text-4xl sm:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            Four steps to a stronger portfolio
          </h2>
          <p
            className="mt-4 text-base max-w-lg mx-auto"
            style={{ color: "var(--muted-foreground)" }}
          >
            From upload to insights in under 60 seconds.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: "easeOut" as const }}
              onClick={() => setActiveStep(i)}
              className="relative rounded-2xl p-5 cursor-pointer transition-all duration-300 group"
              style={{
                background:
                  activeStep === i ? "var(--glow-soft)" : "var(--muted)",
                border:
                  activeStep === i
                    ? "1px solid var(--ring)"
                    : "1px solid var(--border)",
                boxShadow:
                  activeStep === i ? "var(--shadow-glow)" : "var(--shadow-soft)",
              }}
            >
              {activeStep === i && (
                <motion.div
                  layoutId="step-bg"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(ellipse at 30% 30%, var(--glow-soft), transparent 70%)",
                  }}
                />
              )}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{
                      background:
                        activeStep === i ? "var(--primary)" : "var(--background)",
                      color:
                        activeStep === i ? "white" : "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {step.icon}
                  </div>
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3
                  className="font-display text-lg mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Preview panel */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="glass rounded-3xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Score panel */}
            <div
              className="p-8 flex flex-col items-center justify-center gap-6 border-b lg:border-b-0 lg:border-r"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                Portfolio score
              </p>
              <div className="relative">
                <ScoreRing score={87} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="font-display text-4xl font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    87
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    / 100
                  </span>
                </div>
              </div>

              {/* Sub-scores */}
              <div className="w-full space-y-3">
                {[
                  { label: "Visual Design", score: 92 },
                  { label: "Project Depth", score: 85 },
                  { label: "Narrative", score: 80 },
                  { label: "Impact Metrics", score: 88 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--muted-foreground)" }}>
                        {s.label}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {s.score}
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
                        whileInView={{ width: `${s.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" as const }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiter notes panel */}
            <div className="p-8 flex flex-col gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Simulated recruiter notes
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Based on 6-second scan simulation
                </p>
              </div>

              <AnimatePresence>
                <div className="space-y-3">
                  {RECRUITER_NOTES.map((note, i) => (
                    <motion.div
                      key={note}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
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
                </div>
              </AnimatePresence>

              {/* Star rating */}
              <div
                className="mt-auto p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "var(--glow-soft)",
                  border: "1px solid var(--ring)",
                }}
              >
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Recruiter would shortlist
                  </p>
                  <p
                    className="text-lg font-display font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Very likely
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= 4 ? "var(--primary)" : "none"}
                      style={{ color: "var(--primary)" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
