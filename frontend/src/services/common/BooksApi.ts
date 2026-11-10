import type { APIResponseType } from "../../types/APIResponseType"

// catalog for readers; the server filters by `search` (title, author or genre)
export const getCatalogBooks=async(search=""):Promise<{status:number,data:APIResponseType}>=>{
    try{
        const query=search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""
        const res=await fetch(`${import.meta.env.VITE_API_URL}/book-api/books${query}`)
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch{
        return {status:500,data:{message:"Failed to load books. Please try again."}}
    }
}

// every book including removed ones (admin only)
export const getManagedBooks=async():Promise<{status:number,data:APIResponseType}>=>{
    try{
        const res=await fetch(`${import.meta.env.VITE_API_URL}/book-api/manage-books`,{credentials:"include"})
        const data:APIResponseType=await res.json()
        return {status:res.status,data}
    }catch{
        return {status:500,data:{message:"Failed to load books. Please try again."}}
    }
}
