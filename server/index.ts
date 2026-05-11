import express from "express";
import multer from "multer";
import cors from "cors";
import pdfParse from "pdf-parse";

const app = express();
const PORT = 3001;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
app.use(express.json());

// ── Types ────────────────────────────────────────────────────────────────────

interface ReviewData {
  overall_score: number;
  category_scores: {
    visual_design: number;
    project_depth: number;
    narrative: number;
    impact_metrics: number;
  };
  recruiter_notes: string[];
  shortlist_likelihood: "very likely" | "likely" | "unlikely" | "very unlikely";
  shortlist_stars: number;
  summary: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
}

// ── Heuristic scoring ────────────────────────────────────────────────────────

const TECH_KEYWORDS = [
  "javascript","typescript","python","react","vue","angular","node","express",
  "next","nuxt","svelte","tailwind","css","html","sql","postgres","mysql",
  "mongodb","redis","docker","kubernetes","aws","gcp","azure","git","github",
  "graphql","rest","api","backend","frontend","fullstack","mobile","ios",
  "android","flutter","swift","kotlin","java","go","rust","c++","c#",
  "machine learning","ml","ai","tensorflow","pytorch","pandas","numpy",
  "figma","sketch","adobe","ux","ui","design","prototype","wireframe",
];

const PROJECT_KEYWORDS = [
  "project","built","developed","created","designed","implemented","launched",
  "shipped","deployed","engineered","architected","led","built","contributed",
  "open source","case study","portfolio","app","website","platform","system",
  "tool","library","framework","feature","product","service",
];

const IMPACT_PATTERN = /(\d[\d,]*\s*(%|x|×|\+|k\b|m\b|million|thousand|hundred|users?|customers?|clients?|downloads?|installs?|stars?|visits?|requests?|transactions?|revenue|sales|conversions?|reduction|increase|improvement|faster|times))/gi;

const METRIC_NUMBERS = /\b\d{2,}[\d,]*\b/g;

const CONTACT_PATTERN = /(linkedin|github|twitter|behance|dribbble|mailto:|@\w+\.\w+|contact|hire me|get in touch)/i;

const ABOUT_PATTERN = /(about\s*me|who\s*i\s*am|bio|background|introduction|i\s+am\s+a|i'm\s+a|my\s+name|hello,?\s*i|hi,?\s*i)/i;

const HEADLINE_PATTERN = /(full[\s-]?stack|frontend|backend|software\s*engineer|web\s*developer|product\s*designer|ux\s*designer|data\s*scientist|devops|mobile\s*developer|creative\s*director|product\s*manager)/i;

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function scorePortfolioText(
  text: string,
  html: string,
  isUrl: boolean,
  reviewType: string
): ReviewData {
  const lower = text.toLowerCase();

  // ── Visual Design ──────────────────────────────────────────────────────────
  let vd = 20;
  if (isUrl) {
    if (/<meta[^>]+viewport/i.test(html)) vd += 15;
    if (/<meta[^>]+og:image/i.test(html)) vd += 10;
    if (/favicon|apple-touch-icon/i.test(html)) vd += 5;
    if (/<(nav|main|section|article|header|footer)/i.test(html)) vd += 20;
    const imgCount = (html.match(/<img\b/gi) ?? []).length;
    vd += imgCount >= 8 ? 20 : imgCount >= 4 ? 14 : imgCount >= 1 ? 8 : 0;
    if (/tailwind|bootstrap|material|chakra/i.test(html)) vd += 5;
    if (/<link[^>]+stylesheet/i.test(html)) vd += 5;
  } else {
    vd = 45; // Can't assess visual design from PDF/image — give neutral
  }

  // ── Project Depth ──────────────────────────────────────────────────────────
  let pd = 10;
  const projectHits = PROJECT_KEYWORDS.reduce(
    (n, kw) => n + (lower.split(kw).length - 1),
    0
  );
  pd += clamp(projectHits * 5, 0, 35);

  const techFound = TECH_KEYWORDS.filter((kw) => lower.includes(kw));
  pd += clamp(techFound.length * 4, 0, 30);

  if (/github\.com|gitlab\.com/i.test(text)) pd += 12;
  if (/(live demo|view project|see it live|demo link)/i.test(lower)) pd += 8;
  if (/(problem|solution|challenge|result|outcome|impact)/i.test(lower)) pd += 10;

  // ── Narrative ──────────────────────────────────────────────────────────────
  let na = 10;
  if (ABOUT_PATTERN.test(lower)) na += 22;
  if (HEADLINE_PATTERN.test(lower)) na += 15;
  if (CONTACT_PATTERN.test(lower)) na += 12;
  if (/linkedin\.com/i.test(lower)) na += 8;
  const wordCount = text.trim().split(/\s+/).length;
  na += wordCount > 400 ? 20 : wordCount > 150 ? 12 : wordCount > 50 ? 6 : 0;
  if (/(passion|love to|excited about|speciali[sz]e|focus on)/i.test(lower)) na += 8;

  // ── Impact Metrics ─────────────────────────────────────────────────────────
  let im = 10;
  const impactMatches = text.match(IMPACT_PATTERN) ?? [];
  const numberMatches = text.match(METRIC_NUMBERS) ?? [];
  im += clamp(impactMatches.length * 14, 0, 60);
  im += clamp(numberMatches.length * 2, 0, 20);
  if (/%/.test(text)) im += 10;

  // Adjust weights by review type
  if (/software|engineering|backend|frontend|devops/i.test(reviewType)) {
    pd = clamp(pd * 1.1);
  } else if (/design|ux/i.test(reviewType)) {
    vd = clamp(vd * 1.15);
    na = clamp(na * 1.05);
  } else if (/data|analytics|machine learning/i.test(reviewType)) {
    pd = clamp(pd * 1.1);
    im = clamp(im * 1.1);
  } else if (/product management/i.test(reviewType)) {
    na = clamp(na * 1.1);
    im = clamp(im * 1.1);
  }

  const category_scores = {
    visual_design: clamp(vd),
    project_depth: clamp(pd),
    narrative: clamp(na),
    impact_metrics: clamp(im),
  };

  const overall_score = clamp(
    category_scores.visual_design * 0.25 +
      category_scores.project_depth * 0.30 +
      category_scores.narrative * 0.25 +
      category_scores.impact_metrics * 0.20
  );

  // ── Shortlist likelihood ───────────────────────────────────────────────────
  const shortlist_likelihood: ReviewData["shortlist_likelihood"] =
    overall_score >= 78
      ? "very likely"
      : overall_score >= 62
        ? "likely"
        : overall_score >= 46
          ? "unlikely"
          : "very unlikely";

  const shortlist_stars =
    overall_score >= 85 ? 5 : overall_score >= 72 ? 4 : overall_score >= 58 ? 3 : overall_score >= 44 ? 2 : 1;

  // ── Recruiter notes ────────────────────────────────────────────────────────
  const notes: string[] = [];

  if (techFound.length >= 6) {
    notes.push(`Strong technical breadth — ${techFound.slice(0, 5).join(", ")} and more are clearly evidenced.`);
  } else if (techFound.length >= 2) {
    notes.push(`Tech stack is visible (${techFound.slice(0, 3).join(", ")}), but could be more prominent.`);
  } else {
    notes.push("No clear technology stack detected — recruiters scan for this in the first few seconds.");
  }

  if (impactMatches.length >= 4) {
    notes.push(`Good use of quantified results — ${impactMatches.length} metric${impactMatches.length > 1 ? "s" : ""} found, which catches recruiter attention.`);
  } else if (impactMatches.length >= 1) {
    notes.push(`Some numbers present (${impactMatches.slice(0, 2).join(", ")}), but more quantified impact would strengthen the case.`);
  } else {
    notes.push("No measurable outcomes detected — vague descriptions don't hold recruiter attention.");
  }

  if (HEADLINE_PATTERN.test(lower)) {
    notes.push("Role identity is clear from the headline — recruiter can immediately categorize this candidate.");
  } else {
    notes.push("No clear role/title visible above the fold — first 3 seconds are wasted if context is missing.");
  }

  if (/github\.com/i.test(text)) {
    notes.push("GitHub link present — recruiters for technical roles will check this.");
  } else if (/software|engineering|data/i.test(reviewType)) {
    notes.push("No GitHub link found — for a technical role this is a significant gap.");
  }

  if (projectHits >= 8) {
    notes.push("Multiple projects are referenced, suggesting a solid body of work.");
  } else if (projectHits <= 2) {
    notes.push("Very few project references — hard to assess depth from so little content.");
  }

  // ── Recommendations ────────────────────────────────────────────────────────
  const recs: ReviewData["recommendations"] = [];

  if (im < 50) {
    recs.push({
      title: "Add quantified impact to every project",
      description:
        "Replace vague descriptions like "improved performance" with concrete numbers: "reduced load time by 40%", "grew user base from 200 to 2,000", or "shipped 3 features that drove 15% revenue uplift". One number is worth ten adjectives.",
      priority: "high",
    });
  }

  if (!HEADLINE_PATTERN.test(lower)) {
    recs.push({
      title: "Put your role title above the fold",
      description:
        "Recruiters scan dozens of portfolios in minutes. A clear headline like "Full-Stack Engineer · TypeScript · React" tells them in under 3 seconds whether to keep reading. Without it, most won't scroll.",
      priority: "high",
    });
  }

  if (techFound.length < 4) {
    recs.push({
      title: "Make your tech stack scannable",
      description:
        "Add a dedicated skills/tools section with logos or a clean list. Recruiters filter by stack — if yours isn't visible at a glance, you'll be missed even if you have the skills.",
      priority: recs.length < 2 ? "high" : "medium",
    });
  }

  if (!/github\.com/i.test(text) && /software|engineering|data|frontend|backend|devops/i.test(reviewType)) {
    recs.push({
      title: "Link your GitHub profile prominently",
      description:
        "For technical roles, a GitHub profile with active commits is stronger evidence than any description. Put it in the header, not buried in the footer.",
      priority: "medium",
    });
  }

  if (pd < 55) {
    recs.push({
      title: "Go deeper on 2–3 key projects",
      description:
        "Surface-level project lists don't differentiate you. Pick your best 2–3 projects and add a brief case study: the problem, your specific contribution, the technology choices made, and the measurable outcome.",
      priority: "medium",
    });
  }

  if (!ABOUT_PATTERN.test(lower)) {
    recs.push({
      title: "Add a concise bio",
      description:
        "A 2–3 sentence bio humanizes you and frames the rest of the portfolio. It should answer: who you are, what you're best at, and what kind of role you're targeting.",
      priority: "medium",
    });
  }

  if (!CONTACT_PATTERN.test(lower)) {
    recs.push({
      title: "Add visible contact information",
      description:
        "If a recruiter wants to reach you after viewing the portfolio, don't make them search. Email, LinkedIn, or a contact form should be one click away from every page.",
      priority: "low",
    });
  }

  if (isUrl && (html.match(/<img\b/gi) ?? []).length < 3) {
    recs.push({
      title: "Add more visual evidence",
      description:
        "Screenshots, mockups, architecture diagrams, or demo GIFs let recruiters see your work without reading. Aim for at least one strong visual per project.",
      priority: "low",
    });
  }

  // Cap at 5 recs, sorted high → medium → low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const recommendations = recs
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);

  // ── Summary ────────────────────────────────────────────────────────────────
  const strengths = [];
  const weaknesses = [];
  if (techFound.length >= 4) strengths.push("a visible tech stack");
  if (impactMatches.length >= 3) strengths.push("quantified results");
  if (HEADLINE_PATTERN.test(lower)) strengths.push("a clear role identity");
  if (/github\.com/i.test(text)) strengths.push("GitHub presence");
  if (pd >= 60) strengths.push("solid project depth");

  if (im < 40) weaknesses.push("lacks measurable outcomes");
  if (na < 40) weaknesses.push("weak personal narrative");
  if (pd < 40) weaknesses.push("insufficient project depth");
  if (!HEADLINE_PATTERN.test(lower)) weaknesses.push("missing role clarity");

  const summary =
    strengths.length > 0 && weaknesses.length > 0
      ? `This portfolio shows ${strengths.join(" and ")} but ${weaknesses.join(" and ")}. With targeted improvements on quantified impact and clearer positioning, shortlist chances would improve significantly.`
      : strengths.length > 0
        ? `A well-structured portfolio with ${strengths.join(", ")}. Focus on adding more quantified outcomes to convert interest into interviews.`
        : `This portfolio needs significant work before it will consistently pass recruiter screens — the key gaps are ${weaknesses.slice(0, 2).join(" and ")}.`;

  return {
    overall_score,
    category_scores,
    recruiter_notes: notes.slice(0, 5),
    shortlist_likelihood,
    shortlist_stars,
    summary,
    recommendations,
  };
}

// ── Content extraction ───────────────────────────────────────────────────────

async function extractText(
  file: Express.Multer.File | undefined,
  url: string
): Promise<{ text: string; html: string; isUrl: boolean }> {
  if (file) {
    if (file.mimetype === "application/pdf") {
      try {
        const parsed = await pdfParse(file.buffer);
        return { text: parsed.text, html: "", isUrl: false };
      } catch {
        return { text: file.originalname, html: "", isUrl: false };
      }
    }
    // Image — can't extract text; use filename as minimal signal
    return { text: file.originalname, html: "", isUrl: false };
  }

  // URL
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PortfoliaBot/1.0)" },
    signal: AbortSignal.timeout(12_000),
  });
  const html = await res.text();
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15_000);
  return { text, html, isUrl: true };
}

// ── POST /api/review ─────────────────────────────────────────────────────────

app.post("/api/review", upload.single("file"), async (req, res) => {
  try {
    const reviewType: string = req.body.reviewType ?? "General Portfolio Review";
    const url: string = (req.body.url ?? "").trim();
    const file = req.file;

    if (!file && !url) {
      res.status(400).json({ error: "Provide a file or URL." });
      return;
    }

    const { text, html, isUrl } = await extractText(file, url);
    const review = scorePortfolioText(text, html, isUrl, reviewType);
    res.json(review);
  } catch (err) {
    console.error("[/api/review]", err);
    res.status(500).json({ error: "Could not fetch or analyze the portfolio. Check the URL and try again." });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Portfolia API  →  http://localhost:${PORT}\n`);
});
