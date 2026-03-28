import type { APIResponseType } from "../../types/APIResponseType"

export const holdMember=async(userId:string)=>{
    // make request
    try{
        const res=await fetch(`${import.meta.env.VITE_API_URL}/admin-api/block-user`,{
        method:"PUT",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({userId})
        })

        // parse data
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch(err){
        return {status:500,data:{message:"internal server error"}}
    }
}