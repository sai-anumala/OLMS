import type { APIResponseType } from "../../types/APIResponseType";
import type { PaymentFormType } from "../../types/FineType";

export const payFineAPi=async(paymentDetails:PaymentFormType):Promise<{status:number,data:APIResponseType}>=>{
  try{
        let res=await fetch(`${import.meta.env.VITE_API_URL}/transaction-api/transaction`,{
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(paymentDetails)
      })
      const data:APIResponseType=await res.json()
      return {status:res.status,data};
    }catch(err){
        throw err
    }
}
    