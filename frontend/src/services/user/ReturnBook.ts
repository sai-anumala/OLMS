import type { APIResponseType } from "../../types/APIResponseType"

export const returnBookApi=async(bookId:string):Promise<{status:number,data:APIResponseType}>=>{
       try{
           // make client req
           let res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/return-book`,{
               method:"PUT",
               credentials:"include",
               headers:{"Content-Type":"application/json"},
               body:JSON.stringify({bookId})
           })
           // parse res jsonObj
           const data:APIResponseType=await res.json()
           return {status:res.status,data}
       }catch(err){
        return {status:500,data:{message:"Server error.."}}
       }
}