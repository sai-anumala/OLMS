import type { APIResponseType } from "../../types/APIResponseType";
import type { BookType } from "../../types/BookType";


export const updateBookDetails=async(BookData:BookType):Promise<{status:number,data:APIResponseType}>=>{
    try{
        const res=await fetch(`${import.meta.env.VITE_API_URL}/book-api/update-book`,{
            method:"PUT",
            credentials:"include",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(BookData)
        })

        // parse data
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch(err){
        return {status:500,data:{message:"Internal Server Error"}}
    }
}