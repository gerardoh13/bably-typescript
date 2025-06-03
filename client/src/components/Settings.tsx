import { useState, useEffect, useContext } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import BablyApi from "../api";
import Reminders from "./Reminders";
import UserContext from "../users/UserContext";
import AccessSettings from "./AccessSettings";
import Register from "../users/Register";
import Reports from "./Reports";
import type { User, Infant } from "../types";
import type { UserContextType } from "../users/UserContext";


function Settings() {
  const [key, setKey] = useState("reminders");
  const [reminders, setReminders] = useState(null);
  const [infants, setInfants] = useState<Infant[]>([]);
  const [adminAccess, setAdminAccess] = useState(true)
  const [changeCount, setChangeCount] = useState(0);

  const context = useContext(UserContext) as UserContextType;
  const currUser: User | null = context?.currUser;
  const setCurrUser = context?.setCurrUser;

  useEffect(() => {
    async function getAuthUsers() {
      let adminAccessInfants = currUser?.infants.filter((i: Infant) => i.userIsAdmin);
      if (!adminAccessInfants?.length) {
        setAdminAccess(false);
        return;
      }
      adminAccessInfants = await Promise.all(
        adminAccessInfants.map(async (i) => {
          i.users = await BablyApi.getAuthorizedUsers(i.id);
          return i;
        })
      );
      setInfants(adminAccessInfants);
    }
    setReminders(currUser?.reminders);
    getAuthUsers();
  }, [currUser?.infants, changeCount]);

  const updateReminders = async (data: any) => {
    if (!currUser?.email) return
    let res = await BablyApi.updateReminders(currUser?.email, data);
    return res;
  };

  return (
    <div className="card col-12 col-md-6 col-xxl-5 my-auto small text-dark">
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => { if (k !== null) setKey(k); }}
        className="mb-3"
        fill
      >
        <Tab eventKey="reminders" title="Reminders">
          <div className="card-body">
            {reminders ? (
              <Reminders reminders={reminders} update={updateReminders}
                setCurrUser={setCurrUser}

              />
            ) : null}
          </div>
        </Tab>
        {adminAccess ? (
          <Tab eventKey="access" title="Access">
            <div className="card-body">
              {currUser ? (
                <AccessSettings
                  infants={infants}
                  user={currUser}
                  setInfants={setInfants}
                  setChangeCount={setChangeCount}
                />
              ) : null}
            </div>
          </Tab>
        ) : null}
        <Tab eventKey="register" title="Add Child">
          <Register additionalChild />
        </Tab>
        <Tab eventKey="reports" title="Reports">
          <div className="card-body">
            <Reports />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default Settings;
