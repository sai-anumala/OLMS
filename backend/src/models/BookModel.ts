import { Schema,model } from "mongoose";
import { BookType } from "../types/BookType";
// create schema and model
const BookSchema=new Schema<BookType>({
    title:{
        type:String,
        required:[true,"Book name is required"]
    },
    genre:{
        type:String,
        required:[true,"Genre is required"]
    },
    author:{
        type:String,
        required:[true,"Author is required"]
    },
    description:{
        type:String,
        required:[true,"Description of the book is required"]
    },
    copies:{
        type:Number,
        required:[true,"Copies count is required"]
    },
    availability:{
        type:Number,
        required:[true,"Availability count is required"]
    },
    isbn:{
        type:String,
        required:[true,"ISBN is required"]
    },
     image:{
        type:String,
        required:[true,"Image is required"]
     },
     pages:{
        type:Number,
        required:[true,"Pages count is required"]
     },
     published:{
        type:String,
        required:[true,"published date is required"]
     },
     rating:{
        type:Number,
        required:[true,"rating is required"]
     },
     status:{
        type:Boolean,
        default:true
     },
     isDelete:{
        type:Boolean,
        default:false
     }
     
},{
    strict:"throw",
    versionKey:false,
})

// create model 
export const BookModel=model("books",BookSchema)