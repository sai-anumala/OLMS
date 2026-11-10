import type { APIResponseType } from "../../types/APIResponseType";
import type { LoginType } from "../../types/AuthContextType";

// network errors are thrown and handled by the caller (AuthContextProvider)
export const loginUser=async(userData:LoginType):Promise<{status:number,data:APIResponseType}>=>{
  const res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/userLogin`,{
    method:"POST",
    credentials:"include",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(userData)
  })
  const data:APIResponseType=await res.json()
  return {status:res.status,data};
}
