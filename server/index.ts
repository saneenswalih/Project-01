import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const PORT = 3001;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("\n  ✗  ANTHROPIC_API_KEY is not set. Create a .env file with:\n     ANTHROPIC_API_KEY=sk-ant-...\n");
  process.exit(1);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const client = new Anthropic();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
app.use(express.json());

const SYSTEM_PROMPT = `You are an elite portfolio reviewer with 20+ years of combined experience as a hiring manager, senior recruiter, and creative director at top-tier tech companies, agencies, and startups. You have personally reviewed thousands of portfolios and know precisely what makes a candidate stand out — or get filtered out — in the first 10 seconds.

Analyze the provided portfolio with unflinching honesty. Score each dimension critically; reserve 85+ for genuinely exceptional work. A score of 75 is solid, 60 is average.

Return ONLY a valid JSON object with this exact structure — no markdown fences, no explanation, just the JSON:
{
  "overall_score": <integer 0-100>,
  "category_scores": {
    "visual_design": <integer 0-100>,
    "project_depth": <integer 0-100>,
    "narrative": <integer 0-100>,
    "impact_metrics": <integer 0-100>
  },
  "recruiter_notes": [<3-5 short, brutally honest observations a real recruiter would write in their screening notes>],
  "shortlist_likelihood": "<exactly one of: very likely | likely | unlikely | very unlikely>",
  "shortlist_stars": <integer 1-5>,
  "summary": "<2-3 sentence candid overall assessment>",
  "recommendations": [
    {
      "title": "<short, specific action title>",
      "description": "<concrete, actionable advice — no generic platitudes>",
      "priority": "<exactly one of: high | medium | low>"
    }
  ]
}

Include 3-5 recommendations sorted by priority descending.`;

// ── Helper: build content blocks ────────────────────────────────────────────

type ContentBlock =
  | Anthropic.TextBlockParam
  | Anthropic.ImageBlockParam
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

async function buildContentBlocks(
  file: Express.Multer.File | undefined,
  url: string,
  reviewType: string,
  customPrompt: string
): Promise<ContentBlock[]> {
  const blocks: ContentBlock[] = [];

  const header = [
    `Review Type: ${reviewType}`,
    customPrompt ? `Focus area: ${customPrompt}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  blocks.push({ type: "text", text: `Please review this portfolio.\n${header}` });

  if (file) {
    const base64 = file.buffer.toString("base64");
    const mime = file.mimetype;

    if (mime === "application/pdf") {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      });
    } else if (
      mime === "image/jpeg" ||
      mime === "image/png" ||
      mime === "image/gif" ||
      mime === "image/webp"
    ) {
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mime as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: base64,
        },
      });
    }
  } else if (url) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PortfoliaBot/1.0)" },
        signal: AbortSignal.timeout(12_000),
      });
      const html = await res.text();
      // Strip HTML, collapse whitespace, cap at 10K chars
      const text = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 10_000);
      blocks.push({
        type: "text",
        text: `Portfolio URL: ${url}\n\nExtracted page content:\n${text}`,
      });
    } catch {
      blocks.push({
        type: "text",
        text: `Portfolio URL: ${url}\n\nNote: The page could not be fetched automatically. Please evaluate based on the URL and any context available.`,
      });
    }
  }

  return blocks;
}

// ── POST /api/review ─────────────────────────────────────────────────────────

app.post("/api/review", upload.single("file"), async (req, res) => {
  try {
    const reviewType: string = req.body.reviewType ?? "General Portfolio Review";
    const customPrompt: string = req.body.customPrompt ?? "";
    const url: string = req.body.url ?? "";
    const file = req.file;

    if (!file && !url.trim()) {
      res.status(400).json({ error: "Provide a file or URL." });
      return;
    }

    const content = await buildContentBlocks(file, url, reviewType, customPrompt);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: content as Anthropic.ContentBlockParam[] }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      res.status(500).json({ error: "No text response from Claude." });
      return;
    }

    // Extract JSON — handle markdown fences and any leading/trailing prose
    let raw = textBlock.text.trim();
    // Strip ```json ... ``` fences
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    // If there's still non-JSON text before the object, find the first { ... }
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      raw = raw.slice(jsonStart, jsonEnd + 1);
    }
    const review = JSON.parse(raw);
    res.json(review);
  } catch (err) {
    console.error("[/api/review]", err);
    if (err instanceof Anthropic.APIError) {
      res.status(err.status ?? 500).json({ error: err.message });
      return;
    }
    if (err instanceof SyntaxError) {
      res.status(500).json({ error: "AI returned malformed JSON — please retry." });
      return;
    }
    res.status(500).json({ error: "Failed to generate review." });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Portfolia API  →  http://localhost:${PORT}\n`);
});
