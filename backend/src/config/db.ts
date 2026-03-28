import mongoose, {connect} from "mongoose"
import {config} from "dotenv"

config()
// connect to mongodb
const DB_URI=process.env["DB_URI"];
export const connectDB=async()=>{
    try{
        if(DB_URI){
            await connect(DB_URI)
        }
        else{
            throw new Error("Mongodb url is not provided correctly")
        }
    }
    catch(err){
        // abort all
        process.exit(1)
    }
}

// // close the mongodb connection
// export const closeDB=async():Promise<void>=>{
//     try{
//         await connection.close()
//     }
//     catch(err){
//     }
// }