import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ContextPropsType } from "../types/BookContext";
import type { UsersContextType, UserType } from "../types/UserType";
import { getAllUsers } from "../services/admin/UsersData";
import { updateUserDetails } from "../services/common/UpdateUser";
import { deleteUserInfo } from "../services/admin/DeleteUser";
import toast from "react-hot-toast";


// Context
const usersContextObj = createContext<UsersContextType | null>(null);
function UserContext({ children }: ContextPropsType) {
   const [users, setUsers] = useState<UserType[]>([]);

   // ---------------- Fetch users ----------------
   const fetchingUsers = async () => {
       try {
           const resObj = await getAllUsers()
           if(resObj.status===200){
            if (resObj.data?.payload && Array.isArray(resObj.data.payload)) {
                setUsers(resObj.data.payload);
            } else {
                toast.error("Invalid users data received");
            }
           }
           else{
            toast.error(resObj.data.message)
           }

       } catch (err) {
           toast.error("Failed to fetch users");
       }
   };

   // ---------------- Update user info ----------------//
   const updateUserInfo=async(userData: UserType) => {
       try {
            let res=await updateUserDetails(userData)
            if(res.status===200){
                if (res.data?.payload) {
                    setUsers(prev => prev && prev.map(user=>user._id===(res.data.payload as UserType)._id ? (res.data.payload as UserType) : user));
                    toast.success(res.data.message)
                } else {
                    toast.error("Invalid update response");
                }
            }
            else{
                toast.error(res.data.message)
            }
       } catch {
           toast.error("Network error during update.");
       }
   };

   // ---------------- Delete user ----------------
   const deleteUser = async (userId: string) => {
        let resObj=await deleteUserInfo(userId)
        // check status
        if(resObj.status===200){
            setUsers(prevUser=>prevUser && prevUser.filter(user=>user._id!==userId))
            toast.success(resObj.data.message)
        }
        else{
            toast.error(resObj.data.message)
        }
   };

   // ---------------- useEffect ----------------
   useEffect(() => {
       fetchingUsers();
   },[]);

   // Memoize context value
   const contextValue = useMemo(() => ({
     users,
     updateUserInfo,
     deleteUser,
   }), [users]);

   return (
        <usersContextObj.Provider value={contextValue}>
                {children}
        </usersContextObj.Provider>
   );
}

// ---------------- Custom hook ----------------
export const fetchUsers=() => {
   const context =useContext(usersContextObj);
   if (!context) {throw new Error("Must be used within UserProvider")}
   return context;
};

export default UserContext;