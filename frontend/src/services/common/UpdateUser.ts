import type { APIResponseType } from "../../types/APIResponseType";
import type { UserType } from "../../types/UserType";

export const updateUserDetails=async(userData:UserType):Promise<{status:number,data:APIResponseType}>=>{
    try{
        const res=await fetch(`${import.meta.env.VITE_API_URL}/admin-api/update-user`,{
            method:"PUT",
            credentials:"include",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(userData)
        })

        // parse data
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch(err){
        return {status:500,data:{message:"internal server error"}}
    }
}