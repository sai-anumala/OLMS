import type { APIResponseType } from "../../types/APIResponseType"

export const getAllUsers=async():Promise<{status:number,data:APIResponseType}>=>{
    try{
        // make client request
        const res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/users`,{
            method:"GET",
            credentials:"include"
        })

        // parse response json object
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch {
        return {status:500,data:{message:"Internal Server Error"}}
    }
}