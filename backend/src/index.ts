import { config } from "dotenv"
import { connectDB } from "./config/db"
import { UserRoute } from "./routes/UserRoutes"
import { BookRoute } from "./routes/BookRoutes"
import { verifyToken } from "./middlewares/verifyToken"
import { AdminRoute } from "./routes/AdminRoutes"
import cookieParser from 'cookie-parser'
import exp, { NextFunction, Request, Response } from "express"
import cors from "cors"
import { TransactionRoute } from "./routes/TransactionRoutes"

// create server
const app=exp();
config()

// cors accept forntend server
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

// body parser middleware
app.use(exp.json())

// cookie parser middleware
app.use(cookieParser())
// port 
const PORT=process.env["PORT"] || 5000;

// connect to database then start serever
const startServer=async():Promise<void>=>{
    await connectDB()
    try{
        app.listen(PORT,():void=>{
          console.log("Server running on port number",PORT);
        })
    }catch(err){
        // Server startup failed
        process.exit(1)
    }
}

// start the server
startServer()

// redirect to user route if url starts with user-api
app.use("/user-api",UserRoute)
// redirect to book route if url starts with book-api
app.use("/book-api",BookRoute)
// redirect to admin route if url start with admin-api
app.use("/admin-api",AdminRoute)
// redirect to tranction if url start with transcation-api
app.use("/transaction-api",TransactionRoute)
// page refresh 
app.get("/refresh",verifyToken,(req:Request,res:Response)=>{
    // get user data from the req obj
    let userData=(req as any).user
   if(userData){
     // send response
     res.status(200).json({message:"page refreshed",payload:userData})
   }
   else{
    res.status(401).json({message:"page refreshed",payload:null})
   }
})
// error handling middleware
// app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
//     res.status(400).json({message:err.message})
// })
app.use((err:any,req:Request,res:Response,next:NextFunction)=>{

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) =>(e as any).message).join(", ");
  }

  // Duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate field value: ${JSON.stringify(err.keyValue)}`;
  }

  // Cast error (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });

});