import { useContext } from "react";
import UserContext from "../users/UserContext";
import { Outlet, Navigate } from "react-router-dom";
import type { UserContextType } from "../users/UserContext";

function PrivateRoutes() {
  const context = useContext(UserContext) as UserContextType;
  const currUser = context?.currUser;
  const currChild = context?.currChild;

  if (!currUser || !currChild) {
    return <Navigate to="/" replace />;
  } else return <Outlet />;
}

export default PrivateRoutes;
