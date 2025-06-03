import { useState } from "react";
import Login from "../users/Login";
import Signup from "../users/Signup";

type HomeAnonProps = {
  login: (data: { email: string; password: string }) => Promise<{ valid: boolean; errors?: string[] }>;
  signup: (data: { email: string; password: string; firstName: string }) => Promise<{ success: boolean; errors?: string[] }>;
};

function HomeAnon({ login, signup }: HomeAnonProps) {
  const [currPage, setCurrPage] = useState("signup");

  return (
    <>
      <img
        src="bablybg.jpg"
        alt="bably bg"
        className="bablyBg d-none d-md-block"
      />
      <div className="text-light text-center my-auto col-lg-4 col-md-5 col-sm-6 col-11">
        <h1>Bably</h1>
        <h2>Parenting simplified!</h2>
        <div className="card mt-3">
          {currPage === "login" ? (
            <Login login={login} setCurrPage={setCurrPage} />
          ) : (
            <Signup signup={signup} setCurrPage={setCurrPage} login={login}/>
          )}
        </div>
      </div>
    </>
  );
}
export default HomeAnon;
