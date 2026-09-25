import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";
import { loginPath } from "../lib/next";

function AuthGuard() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading/>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={loginPath(location.pathname + location.search)} replace />
    );
  }

  return <Outlet />;
}

export default AuthGuard;