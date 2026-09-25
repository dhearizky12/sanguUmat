import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";
import { loginPath } from "../lib/next";

function RoleGuard({ allow }) {
  const { me, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath(location.pathname + location.search)} replace />;
  }

  if (!allow.includes(me?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleGuard;
