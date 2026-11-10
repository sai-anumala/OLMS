import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ContextPropsType } from "../types/BookContext";
import type { UsersContextType, UserType } from "../types/UserType";
import { getAllUsers } from "../services/admin/UsersData";
import { updateMemberDetails } from "../services/common/UpdateUser";
import { deleteUserInfo } from "../services/admin/DeleteUser";
import { holdMember } from "../services/admin/HoldUser";
import { useAuth } from "./AuthContextProvider";
import toast from "react-hot-toast";


// Context
const usersContextObj = createContext<UsersContextType | null>(null);

// Holds the members list for the admin pages.
// Must be rendered inside AuthContextProvider: users are only loaded when an admin is logged in.
function UserContext({ children }: ContextPropsType) {
   const { currentUser } = useAuth();
   const isAdmin = currentUser?.role === "admin";
   const [users, setUsers] = useState<UserType[]>([]);

   // ---------------- Fetch users ----------------
   const fetchingUsers = async () => {
       try {
           const resObj = await getAllUsers()
           if(resObj.status===200){
            if (resObj.data?.payload && Array.isArray(resObj.data.payload)) {
                setUsers(resObj.data.payload as UserType[]);
            } else {
                toast.error("Invalid users data received");
            }
           }
           else{
            toast.error(resObj.data.message)
           }

       } catch {
           toast.error("Failed to fetch users");
       }
   };

   // replace one user in the list with the version the server sent back
   const replaceUser = (updated: UserType) =>
       setUsers(prev => prev.map(user => user._id === updated._id ? updated : user));

   // ---------------- Update user info ----------------//
   const updateUserInfo=async(userData: UserType) => {
        const res=await updateMemberDetails(userData)
        if(res.status===200 && res.data?.payload){
            replaceUser(res.data.payload as UserType)
            toast.success(res.data.message)
        }
        else{
            toast.error(res.data.message)
        }
   };

   // ---------------- Hold / unhold user ----------------
   const holdUser=async(userId: string) => {
        const res=await holdMember(userId)
        if(res.status===200 && res.data?.payload){
            replaceUser(res.data.payload as UserType)
            toast.success(res.data.message)
        }
        else{
            toast.error(res.data.message)
        }
   };

   // ---------------- Delete user ----------------
   const deleteUser = async (userId: string) => {
        const resObj=await deleteUserInfo(userId)
        // check status
        if(resObj.status===200){
            setUsers(prevUser=>prevUser.filter(user=>user._id!==userId))
            toast.success(resObj.data.message)
        }
        else{
            toast.error(resObj.data.message)
        }
   };

   // ---------------- load users when an admin logs in, clear them on logout ----------------
   useEffect(() => {
       if (isAdmin) {
           fetchingUsers();
       } else {
           setUsers([]);
       }
   },[isAdmin]);

   // Memoize context value
   const contextValue = useMemo(() => ({
     users,
     updateUserInfo,
     deleteUser,
     holdUser,
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }), [users]);

   return (
        <usersContextObj.Provider value={contextValue}>
                {children}
        </usersContextObj.Provider>
   );
}

// ---------------- Custom hook ----------------
// eslint-disable-next-line react-refresh/only-export-components
export const useUsers=() => {
   const context =useContext(usersContextObj);
   if (!context) {throw new Error("Must be used within UserProvider")}
   return context;
};

export default UserContext;
