import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeroSearch from "../components/dashboard/HeroSearch";
import LiveBanner from "../components/dashboard/LiveBanner";
import TopicIndex from "../components/dashboard/TopicIndex";
import QuestionListSection from "../components/dashboard/QuestionListSection";
import NgajiBarengSection from "../components/dashboard/NgajiBarengSection";
import ArticlesSection from "../components/dashboard/ArticlesSection";
import CtaSection from "../components/dashboard/CtaSection";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { CATEGORIES } from "../lib/category";

const MAX_LIST_ITEMS = 8;

function Dashboard() {
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loadingAnswered, setLoadingAnswered] = useState(true);
  const [category, setCategory] = useState("semua");
  const navigate = useNavigate();

  const { isAuthenticated, me } = useAuth();

  useEffect(() => {
    if (isAuthenticated && me && !me.hasCompletedProfile) {
      navigate("/edit-profile");
    }
  }, [isAuthenticated, me, navigate]);

  useEffect(() => {
    // GET /api/question?status=answered gives the real answered set, but still no answer
    // content in the list response, so each one's detail is fetched to get the actual answer
    // text to preview. Fine for a homepage widget at today's question volume; revisit if this
    // ever needs to scale further.
    const fetchAnswered = async () => {
      setLoadingAnswered(true);
      try {
        const listRes = await fetch(`${API_URL}/api/question?status=answered`, { credentials: "include" });
        if (!listRes.ok) throw new Error("Failed to fetch questions");
        const list = await listRes.json();

        const details = await Promise.all(
          list.map((q) =>
            fetch(`${API_URL}/api/question/${q.id}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((detail) => (detail ? { ...q, ...detail } : null))
              .catch(() => null)
          )
        );

        setAnsweredQuestions(details.filter((d) => d && d.answers && d.answers.length > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnswered(false);
      }
    };

    fetchAnswered();
  }, []);

  const topics = CATEGORIES.filter((c) => c.key !== "semua").map((c) => ({
    key: c.key,
    label: c.label,
    count: answeredQuestions.filter((q) => q.category === c.key).length,
  }));

  const filteredQuestions = (
    category === "semua" ? answeredQuestions : answeredQuestions.filter((q) => q.category === category)
  ).slice(0, MAX_LIST_ITEMS);

  const activeCategoryLabel = category === "semua" ? null : topics.find((t) => t.key === category)?.label;

  return (
    <div className="font-serif min-h-screen flex flex-col bg-cream text-ink">
      <Header />

      <main className="grow">
        <HeroSearch answeredCount={answeredQuestions.length} />
        <LiveBanner />
        <TopicIndex topics={topics} activeKey={category} onSelect={setCategory} />
        <QuestionListSection
          questions={filteredQuestions}
          loading={loadingAnswered}
          totalCount={answeredQuestions.length}
          activeCategoryLabel={activeCategoryLabel}
        />
        <NgajiBarengSection />
        <ArticlesSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
