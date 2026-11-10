import type { APIResponseType } from "../../types/APIResponseType"

export const getDashboard=async():Promise<{status:number,data:APIResponseType}>=>{
    try{
        const res=await fetch(`${import.meta.env.VITE_API_URL}/admin-api/dashboard`,{
            method:"GET",
            credentials:"include"
        })
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch{
        return {status:500,data:{message:"Internal Server Error"}}
    }
}
