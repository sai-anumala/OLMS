import type { UserType } from "../../types/UserType";
import type { APIResponseType } from "../../types/APIResponseType";

export function RegisterApi(){

    async function registerApi(userData:UserType) {
       try{
        let res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/user`,{
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(userData)
      })
      const data:APIResponseType=await res.json()
      return {status:res.status,data};
      }catch(err){
          throw err
        }
      }
      return {registerApi}
}