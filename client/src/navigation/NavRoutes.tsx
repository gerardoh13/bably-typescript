import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import HomeAnon from "../components/HomeAnon";
import Home from "../components/Home";
import PrivateRoutes from "./PrivateRoutes";
import PublicRoutes from "./PublicRoutes";
import Register from "../users/Register";
import Calendar from "../components/Calendar";
import UserContext from "../users/UserContext";
import Profile from "../components/Profile";
import ResetPwd from "../users/ResetPwd";
import Settings from "../components/Settings";
import type { UserContextType } from "../users/UserContext";

type NavRoutesProps = {
  login: (data: any) => Promise<{ valid: boolean; errors?: string[] }>;
  signup: (data: any) => Promise<{ success: boolean; errors?: string[] }>;
};


function NavRoutes({ login, signup }: NavRoutesProps) {
  const context = useContext(UserContext) as UserContextType;
  const currUser = context?.currUser;
  const currChild = context?.currChild;
  return (
    <Routes>
      <Route
        path="/"
        element={
          currUser && currChild ? (
            <Home />
          ) : currUser && !currChild ? (
            <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4 my-auto">
              <h2 className="text-center text-light">
                Welcome {currUser.firstName}!
              </h2>
              <p className="text-center text-light">
                <span>
                  if you're using Bably with an existing child account
                </span>
                <br />
                <span>
                  contact the primary user and request access.
                </span>
                <br />
                <span>
                  Otherwise, please fill out the form below.
                </span>
              </p>
              <Register additionalChild={false} />
            </div>
          ) : (
            <HomeAnon login={login} signup={signup} />
          )
        }
      />
      <Route element={<PublicRoutes />}>
        <Route path="/reset" element={<ResetPwd />} />
      </Route>
      <Route element={<PrivateRoutes />}>
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default NavRoutes;
