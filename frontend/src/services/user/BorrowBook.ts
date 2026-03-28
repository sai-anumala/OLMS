import type { APIResponseType } from "../../types/APIResponseType"

// borrow book
export const borrowBook=async(bookId:string):Promise<{status:number,data:APIResponseType}>=>{
    try{
        // make client req to server
        let res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/borrow-book`,{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            credentials:"include",
            body:JSON.stringify({bookId})
        })
    
        // parse response json object
        const data:APIResponseType=await res.json()
        return {status:res.status,data}

    }catch(err){
        return {status:500,data:{message:"Server Error"}}
    }
}
