import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";

function RoleGuard({ allow }) {
  const { me, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(me?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleGuard;
