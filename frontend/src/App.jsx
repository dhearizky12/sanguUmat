import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { BASE_PATH } from "./lib/basePath";
import AuthGuard from "./components/AuthGuard";
import RoleGuard from "./components/RoleGuard";
import Articles from "./pages/Articles";
import Dashboard from "./pages/Dashboard";
import DetailArticle from "./pages/DetailArticle";
import DetailQuestion from "./pages/DetailQuestion";
import Live from "./pages/Live";
import Login from "./pages/Login";
import Ustadz from "./pages/Ustadz";
import UstadzDetail from "./pages/UstadzDetail";
import UstadzEdit from "./pages/UstadzEdit";
import SignInComplete from "./pages/SignInComplete";
import Questions from "./pages/Questions";
import AuthProvider from "./providers/AuthProvider";
import CreateQuestion from "./pages/CreateQuestion";
import AnswerQueue from "./pages/AnswerQueue";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AdminUsers from "./pages/AdminUsers";
import AdminCategories from "./pages/AdminCategories";
import AdminOverview from "./pages/AdminOverview";
import AdminQuestions from "./pages/AdminQuestions";
import AdminComments from "./pages/AdminComments";
import AdminContent from "./pages/AdminContent";
import MyArticles from "./pages/MyArticles";
import Notifications from "./pages/Notifications";
import KajianDetail from "./pages/KajianDetail";
import KajianManage from "./pages/KajianManage";
import Loading from "./components/Loading";

// The article editor (and TipTap with it) loads only when someone writes.
const ArticleEdit = lazy(() => import("./pages/ArticleEdit"));
const articleEditor = (
  <Suspense fallback={<Loading />}>
    <ArticleEdit />
  </Suspense>
);
const KajianEdit = lazy(() => import("./pages/KajianEdit"));
const kajianEditor = (
  <Suspense fallback={<Loading />}>
    <KajianEdit />
  </Suspense>
);

function RedirectToUstadz() {
  const { id } = useParams();
  return <Navigate to={`/ustadz/${id}`} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={BASE_PATH || "/"}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/masuk/selesai" element={<SignInComplete />} />

          <Route path="/" element={<Dashboard />} />

          <Route path="/questions" element={<Questions />} />
          <Route path="/question/detail/:id" element={<DetailQuestion />} />

          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<DetailArticle />} />
          <Route path="/detail-article/:slug" element={<Navigate to="/articles" replace />} />

          <Route path="/live" element={<Live />} />
          <Route path="/live/:id" element={<KajianDetail />} />

          <Route path="/ustadz" element={<Ustadz />} />
          <Route path="/ustadz/:id" element={<UstadzDetail />} />
          {/* The old "Profil ustadz" placeholder. */}
          <Route path="/detail-admin/:id" element={<RedirectToUstadz />} />

          {/* Public, but asks signed-out visitors to sign in (the "Perlu masuk" screen). */}
          <Route path="/question/create" element={<CreateQuestion />} />

          {/* Protected */}
          <Route element={<AuthGuard />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifikasi" element={<Notifications />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/ustadz/:id/ubah" element={<UstadzEdit />} />
            <Route path="/articles/:id/ubah" element={articleEditor} />
            <Route path="/live/:id/ubah" element={kajianEditor} />
          </Route>

          {/* Guru only */}
          <Route element={<RoleGuard allow={["Guru", "Admin"]} fallback="/articles" />}>
            <Route path="/articles/tulis" element={articleEditor} />
            <Route path="/articles/saya" element={<MyArticles />} />
          </Route>

          <Route element={<RoleGuard allow={["Guru", "Admin"]} fallback="/live" />}>
            <Route path="/live/tambah" element={kajianEditor} />
            <Route path="/live/kelola" element={<KajianManage />} />
          </Route>

          <Route element={<RoleGuard allow={["Guru"]} />}>
            <Route path="/jawab-pertanyaan" element={<AnswerQueue />} />
          </Route>

          {/* Admin only */}
          <Route element={<RoleGuard allow={["Admin"]} />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/pertanyaan" element={<AdminQuestions />} />
            <Route path="/admin/komentar" element={<AdminComments />} />
            <Route path="/admin/konten" element={<AdminContent />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
