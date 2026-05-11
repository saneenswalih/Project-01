export interface CategoryScores {
  visual_design: number;
  project_depth: number;
  narrative: number;
  impact_metrics: number;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface ReviewData {
  overall_score: number;
  category_scores: CategoryScores;
  recruiter_notes: string[];
  shortlist_likelihood: "very likely" | "likely" | "unlikely" | "very unlikely";
  shortlist_stars: number;
  summary: string;
  recommendations: Recommendation[];
}
