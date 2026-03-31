import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UserModel } from "../models/UserModel";

// middleware function to verify token
export const verifyToken=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        // get token from  cookies of req obj
        let token=req.cookies["token"]
        let secretKey=process.env["SECRET"]!
        console.log('token and secrete :',token,secretKey)
        // verify token
        let decodedToken=verify(token,secretKey)
        // check decoded token
        if(decodedToken===undefined){
            res.status(401).json({message:"invalid token"})
        }
        else{
            let user=(decodedToken as any).user
            if(user){
                let userData=await UserModel.findOne({_id:user._id}) // if page refresh the token should contain latest data of user
                if(userData){
                    (req as any).user=userData
                }
            }
            // pass to next middleware
            next();
        }
    }catch(err){
        next(err)
    }
}