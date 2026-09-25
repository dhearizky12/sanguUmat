import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeroSearch from "../components/dashboard/HeroSearch";
import QuestionListSection from "../components/dashboard/QuestionListSection";
import CtaSection from "../components/dashboard/CtaSection";
import { API_URL } from "../lib/api";

const MAX_LIST_ITEMS = 8;

function Dashboard() {
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loadingAnswered, setLoadingAnswered] = useState(true);

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

  const latestQuestions = answeredQuestions.slice(0, MAX_LIST_ITEMS);

  return (
    <div className="font-serif min-h-screen flex flex-col bg-cream text-ink">
      <Header />

      <main className="grow">
        <HeroSearch answeredCount={answeredQuestions.length} />
        <QuestionListSection
          questions={latestQuestions}
          loading={loadingAnswered}
          totalCount={answeredQuestions.length}
        />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
