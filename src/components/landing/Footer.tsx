import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="border-t py-10 px-4"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2 select-none">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "var(--primary)" }}
          >
            <Sparkles size={12} color="white" />
          </div>
          <span
            className="font-display text-base"
            style={{ color: "var(--foreground)" }}
          >
            Portfolia AI
          </span>
        </a>

        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          © {new Date().getFullYear()} Portfolia AI. Built for ambitious builders.
        </p>

        <div className="flex items-center gap-5">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--foreground)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--muted-foreground)")
              }
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
