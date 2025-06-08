import { useState, useEffect } from 'react'
import './App.css'
import "./buttons.css";
import { useLocalStorage } from './hooks'
import { decodeToken } from "react-jwt";
import BablyApi from './api';
import UserContext from "./users/UserContext";
import NavRoutes from './navigation/NavRoutes';
import Spinner from './common/Spinner';
import Navbar from './navigation/Navbar';
import { stopBeams, startBeams } from './common/PushNotifications';
import type { User } from "./types";

function App() {
  const [token, setToken] = useLocalStorage<string>("bably-token", "");
  const [childId, setChildId] = useLocalStorage<string>("childId", "");
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [currChild, setCurrChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCurrUser() {
      if (token) {
        try {
          const { email } = decodeToken(token) as { email: string };
          BablyApi.token = token;
          let user = await BablyApi.getCurrUser(email);
          setCurrUser(user);
          if (user.infants.length && !childId) {
            setChildId(user.infants[0].id);
          } else if (!user.infants.length) {
            setLoading(false);
          }
        } catch (err) {
          console.log(err);
          setCurrUser(null);
        }
      } else {
        setLoading(false);
      }
    }
    setLoading(true);
    getCurrUser();
  }, [token, childId, setChildId]);

  useEffect(() => {
    async function getCurrChild() {
      if (childId) {
        try {
          let child = await BablyApi.getCurrChild(childId);
          setCurrChild(child);
        } catch (err) {
          console.log(err);
          setCurrChild(null);
        }
      }
      setLoading(false);
    }
    getCurrChild();
  }, [childId]);

  const login = async (data: any) => {
    try {
      let userToken = await BablyApi.login(data);
      if (userToken) {
        setToken(userToken);
        BablyApi.token = userToken;
        let { email } = decodeToken(userToken) as { email: string };
        if (email !== "demo@demo.com") startBeams(email);
        return { valid: true };
      } else {
        return { valid: false, errors: ["Invalid credentials"] };
      }
    } catch (errors) {
      return { valid: false, errors: Array.isArray(errors) ? errors : [(errors as any)?.message || "Unknown error"] };
    }
  };

  const signup = async (data: any) => {
    try {
      let userToken = await BablyApi.registerUser(data);
      setToken(userToken);
      BablyApi.token = userToken;
      let { email } = decodeToken(userToken) as { email: string };
      startBeams(email);
      console.log("Beams started for user:", email);
      return { success: true };
    } catch (errors) {
      return { success: false, errors: Array.isArray(errors) ? errors : [(errors as any)?.message || "Unknown error"] };

    }
  };

  const logout = async () => {
    const email = currUser?.email;
    setCurrUser(null);
    setCurrChild(null);
    setToken("");
    setChildId("");
    if (email === "demo@demo.com") {
      console.log("Demo user logged out, not stopping beams.");
      return;
    }
    stopBeams();
  };

  const registerInfant = async (data: any) => {
    try {
      if (!currUser) {
        throw new Error("No current user found");
      }
      let newChild = await BablyApi.registerInfant(currUser.id, data);
      setChildId(newChild.id);
      setLoading(true);
    } catch (e) {
      console.log(e);
    }
  };

  const updateInfant = async (id: string, data: any) => {
    let child = await BablyApi.updateInfant(id, data);
    setCurrChild(child);
  };

  return (
    <div className="App">
      <UserContext.Provider
        value={{
          currUser,
          currChild,
          registerInfant,
          updateInfant,
          setChildId,
          setCurrUser
        }}
      >
        {currUser && <Navbar logout={logout} />}
        {loading ? (
          <Spinner />
        ) : (
          <NavRoutes login={login} signup={signup} />
        )}
      </UserContext.Provider>
    </div>
  )
}

export default App
