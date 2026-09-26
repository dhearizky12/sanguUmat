import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeroSearch from "../components/dashboard/HeroSearch";
import LiveStrip from "../components/dashboard/LiveStrip";
import QuestionListSection from "../components/dashboard/QuestionListSection";
import NgajiSection from "../components/dashboard/NgajiSection";
import ArticleSection from "../components/dashboard/ArticleSection";
import CtaSection from "../components/dashboard/CtaSection";
import { API_URL } from "../lib/api";

const LIST_SIZE = 8;

// One GET that resolves to its JSON, or null if it fails — each home section then shows or
// hides on its own, and one failing request never blanks the page.
function useJson(path) {
  const [state, setState] = useState({ loading: true, data: null });
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}${path}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .catch((err) => {
        console.error(err);
        return null;
      })
      .then((data) => !cancelled && setState({ loading: false, data }));
    return () => {
      cancelled = true;
    };
  }, [path]);
  return state;
}

// Beranda, after the home canvas: hero, live strip, Jawaban Terbaru, Ngaji Bareng, Artikel
// Pilihan and the call to action. Five parallel requests, none per item.
function Dashboard() {
  const summary = useJson("/api/home/summary");
  const answers = useJson(`/api/question/browse?pageSize=${LIST_SIZE}`);
  const now = useJson("/api/kajian/now");
  const recordings = useJson("/api/kajian?pageSize=4");
  const articles = useJson("/api/articles?pageSize=4");

  return (
    <div className="font-serif min-h-screen flex flex-col bg-cream text-ink">
      <Header />

      <main className="grow">
        <HeroSearch summary={summary.data} />
        {now.data?.live && <LiveStrip kajian={now.data.live} />}
        <QuestionListSection
          questions={answers.data?.items ?? []}
          loading={answers.loading}
          totalCount={answers.data?.totalPublished ?? 0}
        />
        <NgajiSection now={now.data} recordings={recordings.data?.items} />
        <ArticleSection articles={articles.data?.items} />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
