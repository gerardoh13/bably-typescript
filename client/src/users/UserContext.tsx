import { createContext } from "react";
import type { User, Infant } from "../types";

export interface UserContextType {
  currUser: User | null;
  currChild: Infant | null;
  registerInfant: (data: any) => Promise<void>;
  updateInfant: (id: string, data: any) => Promise<void>;
  setChildId: React.Dispatch<React.SetStateAction<string>>;
  setCurrUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export default UserContext;