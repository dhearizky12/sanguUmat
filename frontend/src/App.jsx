import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BASE_PATH } from "./lib/basePath";
import AuthGuard from "./components/AuthGuard";
import RoleGuard from "./components/RoleGuard";
import Articles from "./pages/Articles";
import Dashboard from "./pages/Dashboard";
import DetailAdmin from "./pages/DetailAdmin";
import DetailArticle from "./pages/DetailArticle";
import DetailQuestion from "./pages/DetailQuestion";
import Live from "./pages/Live";
import Login from "./pages/Login";
import SignInComplete from "./pages/SignInComplete";
import Questions from "./pages/Questions";
import AuthProvider from "./providers/AuthProvider";
import CreateQuestion from "./pages/CreateQuestion";
import AnswerQueue from "./pages/AnswerQueue";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AdminUsers from "./pages/AdminUsers";

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
          <Route path="/detail-article/:slug" element={<DetailArticle />} />

          <Route path="/live" element={<Live />} />

          {/* Public, but asks signed-out visitors to sign in (the "Perlu masuk" screen). */}
          <Route path="/question/create" element={<CreateQuestion />} />

          {/* Protected */}
          <Route element={<AuthGuard />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/detail-admin/:adminId" element={<DetailAdmin />} />
          </Route>

          {/* Guru only */}
          <Route element={<RoleGuard allow={["Guru"]} />}>
            <Route path="/jawab-pertanyaan" element={<AnswerQueue />} />
          </Route>

          {/* Admin only */}
          <Route element={<RoleGuard allow={["Admin"]} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
