import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "./auth";

export const RequireAuth = () => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const RequireAdmin = () => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export const RedirectIfAuthed = () => {
  const user = getUser();
  if (!user) return <Outlet />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
};

