import { useEffect } from "react";
import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";
import UploadCard from "./components/landing/UploadCard";
import HowItWorks from "./components/landing/HowItWorks";
import Footer from "./components/landing/Footer";

export default function App() {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <Header />
      <main>
        <Hero />
        <UploadCard />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
