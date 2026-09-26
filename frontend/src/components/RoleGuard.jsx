import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";
import { loginPath } from "../lib/next";

// Signed-out visitors go to sign in; signed-in ones without an allowed role to `fallback`.
function RoleGuard({ allow, fallback = "/" }) {
  const { me, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath(location.pathname + location.search)} replace />;
  }

  if (!allow.includes(me?.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export default RoleGuard;
