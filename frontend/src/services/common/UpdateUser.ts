import type { APIResponseType } from "../../types/APIResponseType";
import type { UserType } from "../../types/UserType";

const putJson=async(path:string,body:unknown):Promise<{status:number,data:APIResponseType}>=>{
    try{
        const res=await fetch(`${import.meta.env.VITE_API_URL}${path}`,{
            method:"PUT",
            credentials:"include",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(body)
        })
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch{
        return {status:500,data:{message:"internal server error"}}
    }
}

// logged-in user updates their own profile (the server uses the session, not the _id)
export const updateProfile=(userData:Partial<UserType>)=>
    putJson("/user-api/update-user",{
        username:userData.username,
        email:userData.email,
        mobile:userData.mobile,
        ...(userData.password ? {password:userData.password} : {})
    })

// admin updates a member's contact details
export const updateMemberDetails=(userData:UserType)=>
    putJson("/admin-api/update-user",{
        _id:userData._id,
        username:userData.username,
        email:userData.email,
        mobile:userData.mobile
    })
