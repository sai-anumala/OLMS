import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { ContextPropsType } from "../types/BookContext";
import type { UsersContextType, UserType } from "../types/UserType";
import type { ApiResult } from "../services/api";
import * as adminApi from "../services/admin";
import { useAuth } from "./AuthContextProvider";

const usersContextObj = createContext<UsersContextType | null>(null);

// Members list for admin pages; must sit inside AuthContextProvider (loads only for admins)
function UserContext({ children }: ContextPropsType) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [users, setUsers] = useState<UserType[]>([]);

  const fetchingUsers = async () => {
    const res = await adminApi.getAllUsers();
    if (res.status === 200 && Array.isArray(res.data.payload)) setUsers(res.data.payload as UserType[]);
    else toast.error(res.data.message);
  };

  // apply the server's answer: replace the returned user, or run `onSuccess` when there is no payload
  const applyResult = (res: ApiResult, onSuccess?: () => void) => {
    if (res.status !== 200) {
      toast.error(res.data.message);
      return;
    }
    const updated = res.data.payload as UserType | undefined;
    if (updated?._id) setUsers((prev) => prev.map((user) => (user._id === updated._id ? updated : user)));
    onSuccess?.();
    toast.success(res.data.message);
  };

  const updateUserInfo = async (user: UserType) => applyResult(await adminApi.updateMember(user));
  const holdUser = async (userId: string) => applyResult(await adminApi.toggleMemberHold(userId));
  const deleteUser = async (userId: string) =>
    applyResult(await adminApi.deleteMember(userId), () => setUsers((prev) => prev.filter((u) => u._id !== userId)));

  useEffect(() => {
    if (isAdmin) fetchingUsers();
    else setUsers([]);
  }, [isAdmin]);

  const contextValue = useMemo(() => ({ users, updateUserInfo, deleteUser, holdUser }),
  // eslint-disable-next-line react-hooks/exhaustive-deps -- functions only use setters
  [users]);

  return <usersContextObj.Provider value={contextValue}>{children}</usersContextObj.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives with its provider
export const useUsers = () => {
  const context = useContext(usersContextObj);
  if (!context) throw new Error("Must be used within UserProvider");
  return context;
};

export default UserContext;
