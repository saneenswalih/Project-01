import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp, Users } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

const stats = [
  { icon: <Users size={14} />, value: "12,000+", label: "Portfolios reviewed" },
  { icon: <TrendingUp size={14} />, value: "3.4×", label: "More recruiter callbacks" },
  { icon: <Star size={14} />, value: "4.9 / 5", label: "Average rating" },
];

export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-4 pt-40 pb-28 overflow-hidden"
    >
      {/* Gradient halo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      />
      {/* Soft blur orb */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
        }}
      />

      {/* Badge */}
      <motion.div {...fadeUp(0)} className="mb-6">
        <span
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full animate-glow-pulse"
          style={{
            background: "var(--glow-soft)",
            color: "var(--primary)",
            border: "1px solid var(--ring)",
          }}
        >
          <Star size={11} fill="currentColor" />
          AI-powered portfolio intelligence
          <Star size={11} fill="currentColor" />
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        {...fadeUp(0.08)}
        className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] max-w-4xl"
        style={{ color: "var(--foreground)" }}
      >
        Your portfolio,{" "}
        <span
          className="italic"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--primary) 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          seen through
        </span>{" "}
        a recruiter's eyes.
      </motion.h1>

      {/* Subheading */}
      <motion.p
        {...fadeUp(0.16)}
        className="mt-6 text-base sm:text-lg max-w-xl leading-relaxed"
        style={{ color: "var(--muted-foreground)" }}
      >
        Upload your portfolio once. Get instant, honest AI feedback — scored,
        explained, and tailored to the exact role you're targeting.
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...fadeUp(0.24)}
        className="mt-10 flex flex-col sm:flex-row items-center gap-3"
      >
        <a
          href="#upload"
          className="glow-button inline-flex items-center gap-2 px-6 h-12 rounded-full text-sm font-semibold"
        >
          Analyze my portfolio
          <ArrowRight size={15} />
        </a>
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 px-6 h-12 rounded-full text-sm font-medium transition-colors duration-150"
          style={{
            background: "var(--muted)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          }}
        >
          See how it works
        </a>
      </motion.div>

      {/* Stats */}
      <motion.div
        {...fadeUp(0.32)}
        className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
      >
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1">
            <div
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span style={{ color: "var(--primary)" }}>{s.icon}</span>
              {s.label}
            </div>
            <div
              className="font-display text-2xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-32"
        style={{
          backgroundImage:
            "linear-gradient(to top, var(--background), transparent)",
        }}
      />
    </section>
  );
}
