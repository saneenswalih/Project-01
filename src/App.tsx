import { useEffect, useState } from "react";
import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";
import UploadCard from "./components/landing/UploadCard";
import HowItWorks from "./components/landing/HowItWorks";
import ReviewResults from "./components/landing/ReviewResults";
import Footer from "./components/landing/Footer";
import type { ReviewData } from "./types/review";

export default function App() {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <Header />
      <main>
        <Hero />
        <UploadCard onReview={setReviewData} />
        {reviewData ? (
          <ReviewResults data={reviewData} onReset={() => setReviewData(null)} />
        ) : (
          <HowItWorks />
        )}
      </main>
      <Footer />
    </div>
  );
}
