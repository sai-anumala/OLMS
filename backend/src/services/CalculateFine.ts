import { UserType } from "../types/UserType"

// calculate fines
export const calculateFine=(userObj:UserType)=>{
    // calculate fines
        const finePerDay=10 //fine per day
        let today=new Date()  // present date
        // update fine on user obj
        if(userObj.borrowed_books){
            let totalFine=0
            for (let borrowObj of userObj.borrowed_books){
                let dueDate=new Date(borrowObj.dueDate)
                let differTime=today.getTime()-dueDate.getTime()
                let days=Math.floor(differTime/(24*60*60*1000))
                let fine=(days>0 ? days*finePerDay : 0)
                totalFine=totalFine+fine
                borrowObj.fine=fine
             }
             userObj.fine=userObj.fine ? userObj.fine+totalFine : totalFine
            }
        return userObj;
}