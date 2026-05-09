import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Features", href: "#how-it-works" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 flex justify-center"
      style={{ paddingTop: "12px" }}
    >
      <div
        className="w-full max-w-6xl mx-4 rounded-2xl flex items-center justify-between px-5 h-14 transition-all duration-300"
        style={
          scrolled
            ? {
                background: "var(--card)",
                backdropFilter: "blur(20px) saturate(1.8)",
                WebkitBackdropFilter: "blur(20px) saturate(1.8)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-glass)",
              }
            : {
                background: "transparent",
                border: "1px solid transparent",
              }
        }
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 select-none">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--primary)" }}
          >
            <Sparkles size={14} color="white" />
          </div>
          <span
            className="font-display text-lg leading-none"
            style={{ color: "var(--foreground)" }}
          >
            Portfolia
          </span>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
            style={{
              background: "var(--glow-soft)",
              color: "var(--primary)",
              border: "1px solid var(--ring)",
            }}
          >
            AI
          </span>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--foreground)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--muted-foreground)")
              }
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="#upload"
            className="glow-button hidden sm:flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold"
          >
            <Sparkles size={13} />
            Start Review
          </a>
        </div>
      </div>
    </motion.header>
  );
}
