import type { APIResponseType } from "../../types/APIResponseType"
import type { BookType } from "../../types/BookType"

export const addBook=async(bookData:BookType)=>{
    // make request
    try{
        const res=await fetch(`${import.meta.env.VITE_API_URL}/book-api/book`,{
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(bookData)
        })

        // parse data
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch(err){
        return {status:500,data:{message:"internal server error"}}
    }
}