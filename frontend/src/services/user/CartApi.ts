import type { APIResponseType } from "../../types/APIResponseType";


    // ------------------- Add Book To Cart -----------------------
    export const addToCart=async(bookId:string)=>{
        try{
        // make req
            let res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/cartAdd`,{
                method:"PUT",
                credentials:"include",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({bookId})
            })
            const data:APIResponseType=await res.json()
            return {status:res.status,data};
        }catch(err){
            return {status:500,data:{message:"Server error"}}
        }
    }

    // -------------- Remove Book From Cart ------------------------
    export const removeFromCart=async(bookId:string)=>{
        try{
        // make req
            let res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/cartRemove`,{
                method:"PUT",
                credentials:"include",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({bookId})
            })
            const data:APIResponseType=await res.json()
            return {status:res.status,data};
        }catch(err){
            return {status:500,data:{message:"Server error"}}
        }
    }
