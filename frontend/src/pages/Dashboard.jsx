import Footer from "../components/Footer";
import Header from "../components/Header";
import QuestionCard from "../components/QuestionCard";
import ArticleCard from "../components/ArticleCard";
import ArticleMemberCard from "../components/ArticleMemberCard";
import { NavLink } from "react-router-dom";
import { isValidElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { isAuthenticated, me } = useAuth();

  useEffect(() => {
    if ( isAuthenticated && me && !me.hasCompletedProfile )
    {
        navigate("/edit-profile");
    }
  }, [ isAuthenticated, me, navigate]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // const response = await fetch("http://localhost:5236/api/question", 
        const response = await fetch(`http://localhost:5236/api/question?search=${search}`,
        {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        console.error(err)
        // setError(err.message);
      } finally {
        // setLoading(false);
      }
    };

    fetchQuestions();
  }, [search]);

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />

      <main className="grow">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt="Beautiful serene mosque interior with intricate Islamic architecture"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUK50KTJ2hOmuiEacp8LVdISdlSX4ofDO200fpD5TteuACUrexv1EzCUbzGmHjNvDHJe8ZFlZMY7JLpA2bBIovDQ3kVmMV7C8kTWQXXCWgagKR-SWcHb7gn0jSswryFAWP2iKJir4Rdz6sqFMOfCgJ1NQIJN6mO20wz1OF4B9OZOI7biMmPxe3GZws8M7iEKEDeyWiwqkCkbMOSRmKy6F122zjK96ezBAdwC_--JG16GUvxqTkka377faRSzgfy-Cn2AhDcos9Zyc"
            />
            <div className="absolute inset-0 bg-primary-container/60 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-linear-to-b from-primary-container/90 via-primary-container/70 to-background"></div>
          </div>
          <div className="max-w-container-max mx-auto px-gutter py-section-gap lg:pt-32 lg:pb-52 relative z-10 flex flex-col items-center text-center">
            <h1 className="font-display-lg text-display-lg text-secondary-fixed max-w-3xl mb-6 drop-shadow-md">
              Find clarity in traditional wisdom.
            </h1>
            <p className="font-body-lg text-body-lg text-surface-container-low max-w-2xl mb-12 drop-shadow-sm">
              Search our extensive library of Fiqh questions answered by verified scholars, or explore featured articles bridging tradition with
              modern daily life.
            </p>
            <div className="w-full max-w-2xl relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <span
                  className="material-symbols-outlined text-outline group-focus-within:text-primary-container transition-colors"
                  data-icon="search"
                >
                  search
                </span>
              </div>
              <input
                className="w-full pl-14 pr-36 py-5 bg-surface rounded-2xl border-0 focus:ring-4 focus:ring-secondary-fixed/50 font-body-lg text-body-lg text-on-surface shadow-xl transition-all outline-none placeholder:text-outline"
                placeholder="Search Fiqh questions..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <button className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-8 py-3 rounded-xl hover:bg-secondary-fixed transition-colors shadow-md font-bold">
                  Search
                </button>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 items-center">
              <span className="font-label-sm text-label-sm text-surface-container-highest drop-shadow-sm">Popular:</span>
              <a
                className="font-label-sm text-label-sm text-on-primary border border-surface-container-highest/30 bg-surface/10 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-surface/20 transition-colors"
                href="#"
              >
                Prayer times
              </a>
              <a
                className="font-label-sm text-label-sm text-on-primary border border-surface-container-highest/30 bg-surface/10 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-surface/20 transition-colors"
                href="#"
              >
                Zakat calculator
              </a>
              <a
                className="font-label-sm text-label-sm text-on-primary border border-surface-container-highest/30 bg-surface/10 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-surface/20 transition-colors"
                href="#"
              >
                Fasting rules
              </a>
            </div>
          </div>
        </section>
        <section className="max-w-container-max mx-auto px-gutter py-section-gap">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary-container">Latest Questions</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Recent inquiries addressed by our scholarly community.</p>
            </div>
            <NavLink
              to="questions"
              className="hidden sm:flex items-center gap-1 font-label-sm text-label-sm text-primary-container hover:text-tertiary font-semibold"
            >
              View all{" "}
              <span className="material-symbols-outlined" data-icon="arrow_forward">
                arrow_forward
              </span>
            </NavLink>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((v) => (
              <QuestionCard key={v.id} slug={v.id} question={v} adminId={false} />
            ))}
          </div>
        </section>
        <section className="py-section-gap">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary-container">Featured Articles</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Deep dives into Islamic jurisprudence and contemporary issues.
                </p>
              </div>
              <NavLink
                to="articles"
                className="hidden sm:flex items-center gap-1 font-label-sm text-label-sm text-primary-container hover:text-tertiary font-semibold"
              >
                View all
                <span className="material-symbols-outlined" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </NavLink>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[400px]">
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                <img
                  alt="Islamic Architecture"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  data-alt="A close-up view of intricate, traditional Islamic geometric patterns carved into light sandstone. The sunlight casts soft, dimensional shadows across the interlacing stars and polygons. The overall tone is serene, warm, and highly detailed, perfectly complementing a modern, minimalist UI context focused on traditional wisdom."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApuvinrav-NhOPQ9ilMuFVBZanE8UpHiwo4SlzuEIgMOau7mt6xIH1CQ7Lp0eJ5GTeRyzNvN37vfDJ1GxA5XbP-7vylI8lY34TYLrHLrfgbusiLXF-ohIf66-Kb00G-iMGUjhPUVzFZ9OzgnK3JtbzDuA7esr2-0MnjcO7zKFpKHDd6puAPfR8Eta9Ed9StxVF2NwE6J4-X-ngP17SE88Zjhhw-GRCMUV4oiE1jDydo3R9gZFGOcgJSjx1GAu-xAxgZSSeUBBZYho"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary-container/90 via-primary-container/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <span className="inline-block bg-surface/20 backdrop-blur-sm text-on-primary font-label-sm text-label-sm px-3 py-1 rounded-full mb-3 border border-surface/30">
                    Theology
                  </span>
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-primary mb-2">
                    Understanding the Makasid al-Shariah in the Modern Era
                  </h3>
                  <p className="font-body-md text-body-md text-on-primary/80 line-clamp-2">
                    An exploration of the higher objectives of Islamic law and how they guide contemporary legal reasoning.
                  </p>
                </div>
              </div>
              {Array.from({ length: 2 }).map((v, i) => (
                <ArticleMemberCard key={i} slug={i} />
              ))}
              {Array.from({ length: 2 }).map((v, i) => (
                <ArticleCard key={i} slug={i} isMember={false} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
