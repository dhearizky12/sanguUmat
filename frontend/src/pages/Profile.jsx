import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";

function Profile() {
  const { logout, profile } = useAuth();

  const handleLogout = () => {
    logout();
  };
  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-gutter py-section-gap z-10">
          <section className="bg-surface-container-lowest rounded-xl p-gutter shadow-sm mb-section-gap">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-gutter">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-gutter">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border border-primary bg-surface-container-lowest overflow-hidden shadow-lg">
                    <img
                      alt="photo profile"
                      className="w-full h-full object-cover rounded-full"
                      data-alt="photo profiles"
                      src={profile.picture || 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original'}
                    />
                  </div>
                </div>
                <div className="">
                  <h1 className="text-headline-lg text-primary">{profile.name}</h1>
                  <div className="mb-2">{profile.email || 'fatikhunnizam@gmail.com'}</div>
                  <div>{profile.phone}</div>
                  <div>{profile.address}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="border border-primary-container text-primary px-6 py-3 rounded-full font-label-sm text-label-sm shadow-sm active:scale-95"
                  type="submit"
                >
                  Logout
                </button>
                <Link
                  to="/edit-profile"
                  className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm shadow-sm active:scale-95"
                  type="submit"
                >
                  Edit Profil
                </Link>

              </div>
            </div>
          </section>
          <div className="hidden! grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <aside className="lg:col-span-1 space-y-gutter lg:sticky lg:top-24 h-fit">
              <div className="bg-surface-container-lowest rounded-3xl p-gutter border border-[#F3F4F6] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 islamic-pattern opacity-10"></div>
                <h2 className="font-title-md text-title-md text-primary mb-gutter flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">analytics</span>
                  Account Stats
                </h2>
                <div className="grid grid-cols-2 gap-base">
                  <div className="p-base rounded-2xl bg-surface-container-low border border-outline-variant text-center">
                    <span className="block font-headline-lg text-headline-lg text-primary">24</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Questions Asked</span>
                  </div>
                  <div className="p-base rounded-2xl bg-surface-container-low border border-outline-variant text-center">
                    <span className="block font-headline-lg text-headline-lg text-primary">142</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Articles Read</span>
                  </div>
                  <div className="p-base rounded-2xl bg-surface-container-low border border-outline-variant text-center">
                    <span className="block font-headline-lg text-headline-lg text-primary">12</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Saved Fatwas</span>
                  </div>
                  <div className="p-base rounded-2xl bg-surface-container-low border border-outline-variant text-center">
                    <span className="block font-headline-lg text-headline-lg text-primary">350</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Points</span>
                  </div>
                </div>
                <div className="mt-gutter pt-gutter border-t border-outline-variant">
                  <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-base">Recent Achievement</h3>
                  <div className="flex items-center gap-base p-base bg-secondary-container/10 rounded-xl border border-secondary/20">
                    <span className="material-symbols-outlined text-secondary text-3xl">workspace_premium</span>
                    <div>
                      <p className="font-title-md text-[16px] text-on-secondary-container">Deep Diver</p>
                      <p className="font-label-sm text-[12px] text-on-surface-variant">Read 10 Articles in 7 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            <div className="lg:col-span-2 space-y-gutter">
              <div className="flex gap-gutter border-b border-outline-variant pb-base">
                <button className="font-title-md text-title-md text-primary border-b-2 border-primary pb-base px-2">Recent Q&amp;As</button>
                <button className="font-title-md text-title-md text-on-surface-variant hover:text-primary pb-base px-2 transition-all">
                  Bookmarked Articles
                </button>
              </div>
              <div className="space-y-base">
                <div className="bg-surface-container-lowest p-gutter rounded-3xl border border-[#F3F4F6] shadow-sm flex flex-col md:flex-row gap-gutter relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container rounded-l-full"></div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-md">
                        Fiqh al-Ibadah
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Oct 12, 2024</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mb-2">
                      How to maintain focus (Khushu) during prayer while living in a loud urban environment?
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                      Assalamu'alaikum, I find it difficult to concentrate when street noises are constant. What are the recommended practices...
                    </p>
                    <div className="mt-gutter flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-dim overflow-hidden">
                          <img
                            className="w-full h-full object-cover"
                            data-alt="Close-up of a smiling Islamic scholar with a white turban and grey beard. Soft lighting against a neutral green background."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuACWwhf-Eb0629pUlpWURp6vekR2PaWsh0Q9qoEEz_yZp1nlCa0hOzTAhgKlOPNyc5H2AQ_RglyshoPRDj14S8N8TT-jHuo9DQq-HmJYuIQFPO_EqDez1E8Y8IaOjtDz_KVsCxqXNUgnHaJsdaSnQ0hposmoGhKkZEll8gu08-gjuFg1encKmoBACO1SbeG6SW4X1mjHqIgbFoMQFGQKXUd59KClm1gRJsHybVinErkllM0GCT-QXA7ztC7kr-wmEq1qek4yriAUrQ"
                          />
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Answered by Dr. Usman
                      </span>
                    </div>
                  </div>
                  <button className="self-end md:self-center p-base rounded-full hover:bg-surface-container-low transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant">arrow_forward_ios</span>
                  </button>
                </div>
                <div className="bg-surface-container-lowest p-gutter rounded-3xl border border-[#F3F4F6] shadow-sm flex flex-col md:flex-row gap-gutter relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-full"></div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-md">Muamalat</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Oct 05, 2024</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mb-2">
                      Ethical considerations in digital asset trading: A modern perspective.
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                      I am exploring the concepts of Gharar and Riba in the context of decentralized finance. Are there specific scholars...
                    </p>
                    <div className="mt-gutter flex items-center gap-4">
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 italic">
                        <span className="material-symbols-outlined text-[16px]">pending</span>
                        Awaiting scholar response
                      </span>
                    </div>
                  </div>
                  <button className="self-end md:self-center p-base rounded-full hover:bg-surface-container-low transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant">arrow_forward_ios</span>
                  </button>
                </div>
              </div>
              <h3 className="font-headline-lg text-[24px] text-primary pt-gutter">Saved for Later</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-base">
                <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-[#F3F4F6] shadow-sm group">
                  <div className="h-40 overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      data-alt="A macro photograph of an open Qur'an with golden calligraphy, illuminated by natural sunlight streaming through a mosque window. The lighting is ethereal and warm, emphasizing the spiritual texture of the paper and ink."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWvNvkqZGhX6q_OzT8j8KvRcpd7wVoTwNrElZahPNmUKiTWQF2hOahJd5S4e_dRrx9YXU9Fl9K50y3qk5Xk9afSA-ArdRW6RnPz13ivftw-7e8Sc-vhquhAB-jkn3yEyXZvKDqY68OtYyCAY5sn-1UOaCcvxnUyKZompYvmWMe92CKLQNw6wHqFvgu_8Mb94nm3WCZ4LJtyttCoFv7T9WeyeTdlzvNZM4pXJyW3PMsPG6TnRSEfipVV14xdq3AHIcAg0KTW_S3WPk"
                    />
                    <div className="absolute top-4 right-4 bg-surface-container-lowest/90 p-2 rounded-full shadow-md text-secondary">
                      <span className="material-symbols-outlined">bookmark</span>
                    </div>
                  </div>
                  <div className="p-gutter">
                    <h4 className="font-title-md text-[18px] text-on-surface mb-2">The Golden Age of Islamic Ethics</h4>
                    <p className="font-body-md text-[14px] text-on-surface-variant mb-4">
                      Exploring how historical principles can guide modern professional conduct.
                    </p>
                    <a className="font-label-sm text-label-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all" href="#">
                      Read Article <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-[#F3F4F6] shadow-sm group">
                  <div className="h-40 overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      data-alt="A modern Islamic geometric mosaic pattern on a wall, featuring intricate stars and interlaced lines in muted tones of cream and sage green. The lighting is soft and ambient, creating a peaceful and sophisticated digital art atmosphere."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB703BJqI6wc0NCwy2VQiX-I__2kK5XWJtB-mFdtQ7gK7fJ3bupm34yv6uI5tb_qVY9bMttYcCL9vqTZU8iprYX6MilRw1h5-XRxPHYvXK2P-GhRGBWlVWw8bsGKYvyc-ZaVJskfoFbY4TrZf6Rdxgz1E_7RB549anrnJVEzo-sHAPpuhDrW8rgTRbc4raHsFoazoHsfGM-bi_CvTD-4J2B_2rFhv9lBidXV_c-dAwF0oOVQ7_zlXWF-KFBEF6laGZ7Uy9QlhBDhtc"
                    />
                    <div className="absolute top-4 right-4 bg-surface-container-lowest/90 p-2 rounded-full shadow-md text-secondary">
                      <span className="material-symbols-outlined">bookmark</span>
                    </div>
                  </div>
                  <div className="p-gutter">
                    <h4 className="font-title-md text-[18px] text-on-surface mb-2">Digital Mindfullness in Faith</h4>
                    <p className="font-body-md text-[14px] text-on-surface-variant mb-4">
                      Techniques to stay spiritually grounded in the age of constant notifications.
                    </p>
                    <a className="font-label-sm text-label-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all" href="#">
                      Read Article <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
