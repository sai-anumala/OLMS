import {Schema,model} from "mongoose"
import { UserType } from "../types/UserType"



// create schema for borrowed
const BorrowedBookSchema=new Schema({
    bookId:{
        type:Schema.Types.ObjectId,
        ref:"books"
    },
    borrowDate:{
        type:Date,
    },
    dueDate:{
        type:Date
    },
    fine:{
        type:Number,
        default:0
    }
},{
    strict:"throw",
    _id:false,
    versionKey:false
})

// create return schema for borrowed books
const ReturnBookSchema=new Schema({
    bookId:{
        type:Schema.Types.ObjectId,
        ref:"books"
    },
    borrowDate:{
        type:Date,
    },
    returnDate:{
        type:Date
    },
    fine:{
        type:Number,
        default:0
    },
    method:{
        type:String,
        default:"-"
    },
    transactionId:{
        type:Schema.Types.ObjectId,
        ref:"Transaction"
    }
},{
    strict:"throw",
    versionKey:false,
})
// create schema and model
const UserSchema=new Schema<UserType>({
    username:{
        type:String,
        required:[true,"Username is required"]
    },
    mobile:{
        type:String,
        required:[true,"mobile number is required"]
    },
    email:{
        type:String,
        required:[true,"email is required"]
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    fine:{
        type:Number,
    },
    cart:[{
        type:Schema.Types.ObjectId,
        ref:"books"
    }],
    borrowed_books:{
        type:[BorrowedBookSchema]
    },
    return_books:{
        type:[ReturnBookSchema]
    },
    role:{
        type:String,
        default:"user"
    },
    status:{
        type:Boolean,
        default:true
    }
},{
    strict:"throw",
    timestamps:true,
    versionKey:false
})

// create model
export const UserModel=model("users",UserSchema)
