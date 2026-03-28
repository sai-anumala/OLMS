import { Request, Response } from "express"
import { UserModel } from "../models/UserModel"


// -------------------- Update User ---------------------
export const updateUserData=async(req:Request,res:Response)=>{
    // get user data
    let modifiedUserData=req.body
    if(modifiedUserData){
        // verify user exists or not
        let userObj=await UserModel.findById(modifiedUserData._id)
        // check
        if(userObj===null){
            res.status(404).json({message:"User Not Found"})
        }
        else{
            let userDoc=await UserModel.updateOne({_id:modifiedUserData._id},{...modifiedUserData})
            // check update status and response
            if(userDoc.modifiedCount===0){
                res.status(400).json({message:"Error occured while updating user data, try again.."})
            }
            else{
                let user=await UserModel.findById(modifiedUserData._id)
                res.status(200).json({message:"User Information Updated Successfully",payload:user})
            }
        }
    }
}

//--------------------- Hold User -----------------------
export const holdUser=async(req:Request,res:Response)=>{
    let uid=req.body["userId"] // deleting user id
    // check user existance
    let userData=await UserModel.findById(uid)
    if(userData===null){
        res.status(404).json({message:"User Not Found"})
    }
    else{
        // perform soft delete
        let updateStatus=await UserModel.updateOne({_id:uid},{$set:{status:false}})
        // check status and send response
        if(updateStatus.modifiedCount===0){
            res.status(500).json({message:"While blocking user error occcured try again.."})
        }
        else{
            let user=await UserModel.findById(uid)
            res.status(200).json({message:"User Blocked Successfully...",payload:user})
        }
    }
}

//--------------------- Delete User -----------------------
export const deleteUser=async(req:Request,res:Response)=>{
    let uid=req.body["userId"] // deleting user id
    // check user existance
    let userData=await UserModel.findById(uid)
    if(userData===null){
        res.status(404).json({message:"User Not Found"})
    }
    else{
        // perform delete
        let updateStatus=await UserModel.deleteOne({_id:uid})
        // check status and send response
        if(updateStatus.deletedCount===0){
            res.status(500).json({message:"While deleting user error occcured try again.."})
        }
        else{
            res.status(200).json({message:"User information deleted Successfully...",})
        }
    }
}

// -------------------- Active/Inactive Book-----------------
