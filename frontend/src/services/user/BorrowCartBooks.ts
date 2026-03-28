import type { APIResponseType } from "../../types/APIResponseType"

// borrow book
export const cartBorrowBooks=async(books:string[]):Promise<{status:number,data:APIResponseType}>=>{
    try{
        // make client req to server
        let res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/borrow-cart-books`,{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            credentials:"include",
            body:JSON.stringify({books})
        })
    
        // parse response json object
        const data:APIResponseType=await res.json()
        return {status:res.status,data}

    }catch(err){
        return {status:500,data:{message:"Server Error"}}
    }
}
