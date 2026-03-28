import {Request,Response} from 'express'
import { BookModel } from '../models/BookModel'

//-----------------------READ ALL BOOKS------------------
export const readAllBooks=async(req:Request,res:Response)=>{
    //read all books
    let booksList = await BookModel.find()
    // check books 
    if(booksList.length===0){
        // no books in library
        res.status(404).json({message:"No Books found in the library.."})
    }else{
        //response back with books data
        res.status(200).json({message:"Books",payload:booksList})
    }
}

// ------------------ Add Book---------------------------
export const addNewBook=async(req:Request,res:Response)=>{
    // get book details
    let newBook=req.body
    // check book existsed or not
    let bookObj=await BookModel.findOne({isbn:newBook.isbn})
    if(bookObj!==null){
        // send response book existed
        res.status(409).json({message:"Book already exists in the library"})
    }
    else{
        let bookDoc=new BookModel(newBook)
        // save 
        let resObj=await bookDoc.save()
        // send response back
        res.status(201).json({message:"Book Successfully Added To The Library",payload:resObj})
    }
}

// update book details
export const updateBook=async(req:Request,res:Response)=>{
    //get book data from rweq
    const bookdata=req.body
    //find book from collection
    const book=await BookModel.findById({"_id":bookdata._id})
    // check book availabile or not
    if(book===null){
        // if not send response as not found
        res.status(404).json({message:"Book not found"})
    }else{
        // else update the book details
        const bookObj=await BookModel.updateOne({"_id":bookdata._id},{$set:{...bookdata}})
        // check update status
        if(bookObj.modifiedCount!==0){
            res.status(200).json({message:"Book details are updated"})  //send response as updated
        }else{
             res.status(400).json({message:"Book details are not updated"})  //send response as not updated
        }
    }

}

// delete book (soft delete)
export const deleteBook=async(req:Request,res:Response)=>{
    // get id from the url params
    let bookId=req.body["bookId"]

    let bookObj=await BookModel.findById(bookId)
    if(bookObj===null){
        res.status(404).json({message:"Book not found"})
    }
    else{
        if(bookObj.isDelete===true){
            // perform soft delete operation
            let deletedBookStatus=await BookModel.updateOne({_id:bookId},{$set:{isDelete:false}})  
            // check delete status
            if(deletedBookStatus.modifiedCount===0){
                // send response
                res.status(409).json({message:"Book Not Removed From LIbrary,Try Again.."})
            }
            else{
                // error occured while deleting
                res.status(200).json({message:`${bookObj.title} Book Restored To The Library`})  //book not found with id
            }        
        }
        else{
            // perform soft delete operation
            let deletedBookStatus=await BookModel.updateOne({_id:bookId},{$set:{isDelete:true}})  
            // check delete status
            if(deletedBookStatus.modifiedCount===0){
                // send response
                res.status(500).json({message:"While Restoring Book Error occured,try again..."})
            }
            else{
                // error occured while deleting
                res.status(200).json({message:`${bookObj.title} Book Removed From The Library`})  //book not found with id
            } 
        }
    }
}

// -------------------- Book Status Update--------------------
export const bookStatusUpate=async(req:Request,res:Response)=>{
    // get id from the url params
    let bookId=req.body["bookId"]

    let bookObj=await BookModel.findById(bookId)
    if(bookObj===undefined){
        res.status(404).json({message:"Book not found"})
    }
    else{
        if(bookObj?.status===true){
            // perform soft delete operation
            let bookStatus=await BookModel.updateOne({_id:bookId},{$set:{status:false}})  //changed status to true
            
            // check delete status
            if(bookStatus.modifiedCount!==0){
                // send response
                res.status(200).json({message:"Book Status Changed To In-Active"})
            }
            else{
                // error occured while deleting
                res.status(400).json({message:"Book not found"})  //book not found with id
            }
        }
        else{
           // perform soft delete operation
            let deletedBook=await BookModel.updateOne({_id:bookId},{$set:{status:true}})  //changed status to true
            
            // check delete status
            if(deletedBook.modifiedCount!==0){
                // send response
                res.status(200).json({message:"Book Status Changed To Active"})
            }
            else{
                // error occured while deleting
                res.status(400).json({message:"Book not found"})  //book not found with id
            } 
        }

    }
}

