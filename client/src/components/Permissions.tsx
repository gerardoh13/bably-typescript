import Dropdown from "react-bootstrap/Dropdown";
import type { Infant, InfantUser } from "../types";

type PermissionsProps = {
  infant: Infant;
  updateNotifications: (
    userId: string,
    infantId: string,
    notifyAdmin: boolean
  ) => Promise<void>;
  updateAccess: (
    userId: string,
    infantId: string,
    crud: boolean
  ) => Promise<void>;
  removeAccess: (userId: string, infantId: string) => Promise<void>;
};

function Permissions({
  infant,
  updateNotifications,
  updateAccess,
  removeAccess,
}: PermissionsProps) {

  interface HandleChangeNotifEventTarget extends EventTarget {
    disabled: boolean;
  }

  const handleChangeNotif = async (
    userId: string,
    notifyAdmin: boolean,
    target: HandleChangeNotifEventTarget
  ) => {
    target.disabled = true;
    await updateNotifications(userId, infant.id, notifyAdmin);
    target.disabled = false;
  };

  interface HandleAccessEventTarget extends EventTarget {
    disabled: boolean;
  }

  const handleAccess = async (
    userId: string,
    crud: boolean,
    target: HandleAccessEventTarget,
    remove: boolean = false
  ) => {
    if (remove) {
      await removeAccess(userId, infant.id);
    } else {
      target.disabled = true;
      await updateAccess(userId, infant.id, crud);
      target.disabled = false;
    }
  };

  const createRows = (users: InfantUser[]) => {
    return users.map((u) => (
      <tr key={u.userId} className="fw-bold mt-2">
        <td className="pt-3">{u.userName}</td>
        <td>
          <Dropdown>
            <Dropdown.Toggle variant="bablyBlue" id="dropdown-basic">
              {u.crud ? "Guardian" : "Babysitter"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={(e) => handleAccess(u.userId, true, e.target as HTMLButtonElement)}
              >
                Guardian
              </Dropdown.Item>
              <Dropdown.Item
                onClick={(e) => handleAccess(u.userId, false, e.target as HTMLButtonElement)}
              >
                Babysitter
              </Dropdown.Item>
              <Dropdown.Item
                onClick={(e) => handleAccess(u.userId, false, e.target as HTMLButtonElement, true)}
              >
                Remove
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
        <td>
          <div className="col-6 form-check form-switch mx-auto me-sm-4">
            <input
              className="form-check-input lgSwitch"
              type="checkbox"
              role="switch"
              name="enabled"
              checked={u.notifyAdmin}
              onChange={(e) =>
                handleChangeNotif(u.userId, u.notifyAdmin, e.target)
              }
            />
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="text-center">
      <hr />
      <p className="my-2 fw-bold">Change access to {infant.firstName}</p>
      <small>
        Enable notifications to get notified when a user logs new data
      </small>
      <table className="table table-striped bg-light mt-2">
        <thead>
          <tr className="small">
            <th className="wThird" scope="col">
              Name
            </th>
            <th className="wThird" scope="col">
              Role
            </th>
            <th className="wThird" scope="col">
              Notfications
            </th>
          </tr>
        </thead>
        <tbody>{createRows(infant.users)}</tbody>
      </table>
    </div>
  );
}

export default Permissions;
