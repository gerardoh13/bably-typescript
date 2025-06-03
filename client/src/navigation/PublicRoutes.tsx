import { useContext } from "react";
import UserContext from "../users/UserContext";
import { Outlet, Navigate } from "react-router-dom";
import type { UserContextType } from "../users/UserContext";

function PublicRoutes() {
  const context = useContext(UserContext) as UserContextType;
  const currUser = context?.currUser;
  // If the user is logged in, redirect to home
  // If the user is not logged in, allow access to public routes

  if (currUser) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default PublicRoutes;
