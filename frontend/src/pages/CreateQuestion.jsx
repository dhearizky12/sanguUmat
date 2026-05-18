import { NavLink } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useState } from "react";

function CreateQuestion() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  const submitQuestion = async () => {
    const response = await fetch("http://localhost:5236/api/question", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    if (response.ok) {
      alert("Pertanyaan berhasil dibuat");

      setTitle("");
      setContent("");
    }
  };

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow mx-auto w-full px-margin-mobile md:px-gutter py-section-gap relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary-container"></div>
              <div className="mb-6">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Buat Pertanyaan</h1>
              </div>
              <form className="space-y-6">
                {/* <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2" htmlFor="topic">
                    Topic Classification
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container appearance-none transition-colors"
                      id="topic"
                    >
                      <option>Select a general topic...</option>
                      <option>Prayer (Salah)</option>
                      <option>Fasting (Sawm)</option>
                      <option>Charity (Zakat)</option>
                      <option>Family &amp; Marriage</option>
                      <option>Finance &amp; Trade</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div> */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Judul</label>
                  <input
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    type="text"
                    placeholder="Tulis Judul"
                    value={title}
                    onChange={handleTitleChange}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2" htmlFor="question">
                    Detail Pertanyaal
                  </label>
                  <textarea
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    id="question"
                    placeholder="Jelaskan pertanyaan anda dengan detail..."
                    rows="6"
                    value={content}
                    onChange={handleContentChange}
                  ></textarea>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    className="bg-primary-container text-white px-6 py-3 rounded-full font-label-sm text-label-sm hover:bg-tertiary-container transition-colors shadow-sm active:scale-95 flex items-center gap-2"
                    type="button"
                    onClick={submitQuestion}
                  >
                    Kirim Pertanyaan
                    <span className="material-symbols-outlined text-[18px]" data-icon="send">
                      send
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <section className="lg:col-span-7 max-w-container-max mx-auto px-gutter">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary-container">Pertanyaan Saya</h2>
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
            <div className="space-y-6">
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-[0_4px_20px_rgba(6,78,59,0.05)] flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary-fixed-dim"></div>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[12px] font-semibold border border-primary-container/20">
                      Finance &amp; Trade
                    </span>
                    <span className="text-outline font-label-sm text-label-sm">2 days ago</span>
                  </div>
                  <span className="flex items-center gap-1 text-tertiary-fixed-dim font-label-sm text-label-sm bg-tertiary-fixed-dim/10 px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]" data-icon="check_circle">
                      check_circle
                    </span>
                    Answered
                  </span>
                </div>
                <h3 className="font-body-lg text-body-lg text-on-surface font-medium line-clamp-2">
                  Is it permissible to invest in index funds that contain a small percentage of non-compliant companies?
                </h3>
                <div className="mt-2 pl-4 border-l-2 border-secondary-fixed-dim bg-surface-container-low/50 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-secondary-container" data-icon="verified" data-weight="fill">
                      verified
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">Sheikh Ahmad Scholar</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                    The general consensus among contemporary scholars is that if the core business is permissible, a small percentage of incidental
                    non-compliant income can be purified. However, the threshold for this...
                  </p>
                  <button className="mt-3 text-primary-container font-label-sm text-label-sm hover:underline">Read Full Answer</button>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-[0_4px_20px_rgba(6,78,59,0.05)] flex flex-col gap-4 relative overflow-hidden opacity-90">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[12px] font-semibold border border-primary-container/20">
                      Prayer (Salah)
                    </span>
                    <span className="text-outline font-label-sm text-label-sm">Yesterday</span>
                  </div>
                  <span className="flex items-center gap-1 text-on-secondary-container font-label-sm text-label-sm bg-secondary-container/20 px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]" data-icon="schedule">
                      schedule
                    </span>
                    Pending Review
                  </span>
                </div>
                <h3 className="font-body-lg text-body-lg text-on-surface font-medium">
                  How should one adjust prayer times when traveling across multiple time zones during a single flight?
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                  I frequently travel for work and sometimes cross 4-5 time zones in a single 12-hour flight. I'm confused about when to pray Maghrib
                  and Isha while in the air...
                </p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant border-dashed shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[12px] font-semibold border border-outline-variant">
                      Draft
                    </span>
                    <span className="text-outline font-label-sm text-label-sm">Just now</span>
                  </div>
                  <button className="text-outline hover:text-error transition-colors p-1 rounded-full hover:bg-error-container/20">
                    <span className="material-symbols-outlined text-[20px]" data-icon="delete">
                      delete
                    </span>
                  </button>
                </div>
                <h3 className="font-body-lg text-body-lg text-on-surface font-medium italic text-on-surface-variant/70">
                  Untitled Question regarding Zakat on inherited property...
                </h3>
                <div className="mt-2 flex gap-3">
                  <button className="bg-surface-container-high text-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm hover:bg-surface-variant transition-colors">
                    Continue Editing
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CreateQuestion;
