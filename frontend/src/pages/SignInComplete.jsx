import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import { useAuth } from "../hooks/useAuth";
import { safeNext } from "../lib/next";

// Where the backend sends the browser after Google (/masuk/selesai?next=…). Once the
// session has loaded: an incomplete profile goes to the profile form once, carrying the
// same `next`; a complete one goes straight back to the page the visitor started from.
function SignInComplete() {
  const { loading, isAuthenticated, me } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (!me?.hasCompletedProfile) {
      navigate(`/edit-profile?next=${encodeURIComponent(next)}`, { replace: true });
    } else {
      navigate(next, { replace: true });
    }
  }, [loading, isAuthenticated, me, next, navigate]);

  return <Loading />;
}

export default SignInComplete;
