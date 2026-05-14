import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import Articles from "./pages/Articles";
import Dashboard from "./pages/Dashboard";
import DetailAdmin from "./pages/DetailAdmin";
import DetailArticle from "./pages/DetailArticle";
import DetailQuestion from "./pages/DetailQuestions";
import Live from "./pages/Live";
import Login from "./pages/Login";
import Questions from "./pages/Questions";
import AuthProvider from "./providers/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<AuthGuard />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/questions" element={<Questions />} />
            <Route
              path="/detail-question/:slug"
              element={<DetailQuestion />}
            />
            <Route path="/articles" element={<Articles />} />
            <Route
              path="/detail-article/:slug"
              element={<DetailArticle />}
            />
            <Route path="/live" element={<Live />} />
            <Route
              path="/detail-admin/:adminId"
              element={<DetailAdmin />}
            />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
