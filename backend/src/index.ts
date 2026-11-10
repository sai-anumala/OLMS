import { config } from "dotenv"
config();
import { connectDB } from "./config/db"
import { UserRoute } from "./routes/UserRoutes"
import { BookRoute } from "./routes/BookRoutes"
import { verifyToken } from "./middlewares/verifyToken"
import { AdminRoute } from "./routes/AdminRoutes"
import cookieParser from 'cookie-parser'
import exp, { NextFunction, Request, Response } from "express"
import cors from "cors"
import { TransactionRoute } from "./routes/TransactionRoutes"
import { chatbot } from "./controllers/BookControllers";
import expressAsyncHandler from "express-async-handler";
import { rateLimit } from "./middlewares/rateLimit";
import { serializeUser } from "./services/CalculateFine";

// create server
const app=exp();
app.set("trust proxy", 1);
// cors accept forntend server
// FRONTEND_URL can hold several comma-separated origins; defaults to the Vite dev server
const allowedOrigins = (process.env['FRONTEND_URL'] || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
 origin: (origin, callback) => {
   if (!origin || allowedOrigins.includes(origin)) {
     callback(null, true);
   } else {
     callback(null, false);
   }
 },
 credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
 
// body parser middleware
app.use(exp.json())

// cookie parser middleware
app.use(cookieParser())
// port 
const PORT=process.env["PORT"] || 5000;

// connect to database then start serever
const startServer=async():Promise<void>=>{
  try{
        await connectDB()
        app.listen(PORT,():void=>{
          console.log("Server running on port number",PORT);
        })
    }catch(err){
        // Server startup failed
        console.error("❌ Startup error:", err);
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
// page refresh: verifyToken already answers 401 when there is no valid session
app.get("/refresh",verifyToken,(req:Request,res:Response)=>{
  res.status(200).json({message:"page refreshed",payload:serializeUser((req as any).user)})
})

// chatbot is public, so limit it to protect the paid AI API quota
app.post("/chatbot",rateLimit({windowMs:60*1000,max:10}),expressAsyncHandler(chatbot));

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
    message = `Invalid ${err.path}`;
  }

  // don't leak internal error details to clients
  if (statusCode >= 500) {
    console.error(err);
    message = "Internal Server Error";
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });

});
