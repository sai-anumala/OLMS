import type { APIResponseType } from "../../types/APIResponseType"

export const deleteBookInfo=async(bookId:string)=>{
    // make request
    try{
        const res=await fetch(`${import.meta.env.VITE_API_URL}/book-api/delete-book`,{
        method:"PUT",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({bookId})
        })

        // parse data
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch(err){
        return {status:500,data:{message:"Internal Server Error"}}
    }
}