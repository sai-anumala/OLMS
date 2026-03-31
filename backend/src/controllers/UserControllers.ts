import { Request, Response } from "express";
import { UserType } from "../types/UserType";
import {compare, hash} from 'bcryptjs'
import { UserModel } from "../models/UserModel";
import {sign} from 'jsonwebtoken'
import { BookModel } from "../models/BookModel";
import { calculateFine } from "../services/CalculateFine";



// -------------------- Add New User / Register ----------
export const addNewUser=async(req:Request,res:Response)=>{
    // get user data from req obj
    const user:UserType= req.body;
    // check user exists or not
    let userData=await UserModel.findOne({username:user.username})

    // check user
    if(userData!==null){
        res.status(409).json({message:"User already exists,try with different username"})
    }
    else{

        //hashed password of user
        let hashedPassword = await hash(user.password,10)
        //replace plain password with hashed password
        user.password = hashedPassword
        //create new doc
        let userDoc = new UserModel(user)
        //save
        let {password,...userObj}=(await userDoc.save()).toObject()
        //send res
        res.status(201).json({message:"User Created Successfully",payload:userObj})
    }
}

// -------------------- Login User-----------------------
export const loginUser=async(req:Request,res:Response)=>{
    // get user data
    let {username,password}=req.body;

    // get user data from databse
    let userObj=await UserModel.findOne({username:username})

    // verify username
    if(userObj===null){
        res.status(401).json({message:"username is invalid"})
    }
    else{
            // verify password
            let status=await compare(password,userObj.password)   // use compare() method in bcrypt module
            // check status and send response 
            if(status===false){
                res.status(401).json({message:"Invalid password.."})
            }
            else{
                // create token using JWT by using sign() method
                let {password,...userData}=userObj.toObject()   // remove password in useroBj
                // generate signed token
                let signedToken=sign({user:userData},process.env["SECRET"]!,{expiresIn:"1d"})  //for pa
                // store token in httpOnly cookie (for security)
                res.cookie("token",signedToken,{
                    httpOnly:true,
                    sameSite:"none",
                    secure:true,
                    maxAge:24*60*60*1000,
                    domain: process.env["COOKIE_DOMAIN"],
                    path: "/",
                })
                // send response back
                res.status(200).json({message:"Logined Successfully..",payload:userData})
            }
        }
}

// -------------------- Read all users -----------------
export const readAllUsers=async(req:Request,res:Response)=>{
    // get all users data from database
    let usersData=await UserModel.find()
    // check whether users are exists or not
    if(usersData.length===0){
        res.status(404).json({message:"No users exists in the library"})
    }
    else{
        // calculate fines
        // update fine on user obj
        for (let userObj of usersData){
            userObj.fine=0 // reset total fine befoe calculating
            let uObj:any=calculateFine(userObj)
            await uObj.save()
            }
        }
        // send users details as response
        res.status(200).json({message:"Users details",payload:usersData})
}

// -------------------- Update User ---------------------
export const updateUser=async(req:Request,res:Response)=>{
    // get user data
    let modifiedUserData:UserType=req.body
    // verify user exists or not 
    let userObj=await UserModel.findById(modifiedUserData._id)
    // check 
    if(userObj===null){
        res.status(404).json({message:"user not found"})
    }
    else{
        let userDoc=await UserModel.updateOne({_id:modifiedUserData._id},{...modifiedUserData})
        // check update status and response
        if(userDoc.modifiedCount===0){
            res.status(400).json({message:"Error occured while updating user data, try again.."})
        }
        else{
            res.status(200).json({message:"User Data updated"})
        }
    }
}

//--------------------- Add To Cart ----------------------
export const addToCart=async(req:Request,res:Response)=>{
    // get user if from url
    // let userId=req.params["id"]
    let userId=(req as any).user["_id"] //get if from token
    // get book id from body
    let {bookId}=req.body
    // get user document from database
    let userObj=await UserModel.findById(userId)
    // check user exists or not
    if(userObj===null){
        res.status(404).json({message:"user not found"})
    }
    else{
        // check whether book id in cart or not
        let cartStatus=userObj.cart?.find(book=>book.toString()===bookId)
        // check status
        if(cartStatus===undefined){
            // add book to cart
            let updateStatus=await UserModel.updateOne({_id:userId},{$push:{cart:bookId}})
            // check updateStatus
            if(updateStatus.modifiedCount===0){
                // send response
                res.status(400).json({message:"Error occured while adding book in cart"})
            }
            else{
                // send response as book addded successfully
                res.status(200).json({message:"Book successfully added to cart"})
            }
        }
        else{
            // send response
            res.status(409).json({message:"Book already exists in cart"})
        }
    }
}

// -------------------- Remove From Cart-----------------
export const removeFromCart=async(req:Request,res:Response)=>{
    // get user if from url
    // let userId=req.params["id"]
    let userId=(req as any).user["_id"] //get if from token
    // get book id from body
    let {bookId}=req.body
    // get user document from database
    let userObj=await UserModel.findById(userId)
    // check user exists or not
    if(userObj===null){
        res.status(404).json({message:"user not found"})
    }
    else{
        // check whether book id in cart or not
        let cartStatus=userObj.cart?.find(book=>book.toString()===bookId)
        // check status
        if(cartStatus!==undefined){
            // add book to cart
            let updateStatus=await UserModel.updateOne({_id:userId},{$pull:{cart:bookId}})
            // check updateStatus
            if(updateStatus.modifiedCount===0){
                // send response
                res.status(400).json({message:"Error occured while removing book from cart"})
            }
            else{
                // send response as book addded successfully
                res.status(200).json({message:"Book removed from cart"})
            }
        }
        else{
            // send response
            res.status(404).json({message:"Book not exists in cart"})
        }
    }
}

// -------------------- Borrow Book---------------------
export const borrowBook=async(req:Request,res:Response)=>{
    // get user id from req obj
    let uid=(req as any).user["_id"]
    // let uid="6901dde6ad8cef068ba55ae0"
    // check user existance
    let userObj=await UserModel.findById(uid)
    // check user existance 
    if(userObj===null){
        res.status(404).json({message:"User not found"})
    }
    else{
        // check borrow limit 
        const MAX_BORROW_LIMIT=4
        if(userObj.borrowed_books && userObj.borrowed_books?.length>=MAX_BORROW_LIMIT){
            res.status(400).json({message:"Borrow limit reached. Please return at least one book before borrowing a new one.."})
        }
        else{
            // get book id
            let bookId=req.body["bookId"]
            // check book existance
            let bookObj=await UserModel.findOne({_id:uid,"borrowed_books.bookId":bookId})
            // get book document from database
            let bookDoc=await BookModel.findById(bookId)
            // check book existance in database
            if(bookDoc===null){
                res.status(404).json({message:"Book not available"})
            }
            else{
                // check book availability
                if(bookDoc.availability===0){
                    res.status(409).json({message:"Book is currently unavailable for borrowing. All copies have been checked out.."})
                }
                else{
                // check existance of book object in borrowed book array
                    if(bookObj===null){
                        // borrow book
                        const today=new Date()
                        const due_Date=new Date()
                        due_Date.setDate(today.getDate()+7)
                        // create borrow book object along with details
                        let borrowBookObj={
                            bookId:bookId,
                            borrowDate:today,
                            dueDate:due_Date,
                            fine:0
                        }
                        // decrease book availability count in book obj
                        let decreaseStatus=await BookModel.updateOne({_id:bookId},{$inc:{availability:-1}})
                        // check decereament of book availability count status
                        if(decreaseStatus.modifiedCount===0){
                            res.status(500).json({message:"Failed While Borrowing Book, try again.."})
                        }
                        else{
                        // add book details alogn with dates and fine to user borrow book list
                        let borrowStatus=await UserModel.updateOne({_id:uid},{$push:{borrowed_books:{...borrowBookObj}}})
                        // check borrow status and send response
                        if(borrowStatus.modifiedCount!==0){
                            let user=await UserModel.findById(uid)
                            res.status(200).json({message:"Book Borrowed Successfully..",payload:user?.borrowed_books})
                        }
                        else{
                            res.status(500).json({message:"Failed While Borrowing Book, try again.."})
                        }

                        // let userDoc=await UserModel.findOneAndUpdate({_id:uid},{$push:{borrowed_books:{...borrowBookObj}}})
                        // // check borrow status and send response
                        // if(userDoc?.borrowed_books && userObj.borrowed_books && userDoc?.borrowed_books?.length>userObj.borrowed_books?.length){
                        //     res.status(200).json({message:"Book Borrowed Successfully..",payload:userDoc.borrowed_books})
                        // }
                        // else{
                        //     res.status(500).json({message:"Failed While Borrowing Book, try again.."})
                        // }
                    }
                }
                
            else{
                // send response as book already exists
                res.status(409).json({message:"Book already borrowed.."})
            }
    }
            }
        }
    }
}

// -------------------- Return Book---------------------
export const returnBook=async(req:Request,res:Response)=>{
    // get user id
    let uid=(req as any).user["_id"]
    // let uid="6901dde6ad8cef068ba55ae0"
    // get user from database using uid
    let userDoc=await UserModel.findById(uid)
    // check user exists or not
    if(userDoc===null){
        res.status(404).json({message:"User not found"})
    }
    // user found
    else{
        // get return book id
        let bid=req.body["bookId"]
        // check book whether exists or not in borrow book list
        let borrowedBook=userDoc.borrowed_books?.find(obj=>obj.bookId.toString()===bid)
        if(borrowedBook===undefined){
            res.status(404).json({message:"Book is not on borrow list"})
        }
        else{
            // check book fine
            let fine=borrowedBook.fine
            // check fine
            if(fine>0){
                res.status(409).json({message:"Pay fine before return the book.."})
            }
            else{
                
                //take borrow obj
                let borrowObj=userDoc.borrowed_books?.find(book=>book.bookId.toString()===bid) 
                
                // remove book from userObj of borrow list and update book availability
                let returnStatus=await UserModel.updateOne({_id:uid},{$pull:{borrowed_books:{bookId:bid}}})
                // check return status
                if(returnStatus.modifiedCount===0){
                    res.status(500).json({message:"Returning Book failed try again.."})
                }
                else{
                    let bookAvailStatus=await BookModel.updateOne({_id:bid},{$inc:{availability:1}})
                    // check availability status
                    if(bookAvailStatus.modifiedCount===0){
                        res.status(500).json({message:"Returning Book failed try again.."})
                    }
                    else{
                        // update in return array
                        if(borrowObj){
                            let today=new Date()
                            let returnObj={
                                bookId:borrowObj?.bookId,
                                borrowDate:borrowObj?.borrowDate,
                                fine:borrowObj?.fine,
                                returnDate:today
                            }
                            
                            // update return obj
                            let updateReturnStatus=await UserModel.updateOne({_id:uid},{$push:{return_books:returnObj}})
                            let user=await UserModel.findById(uid)
                            res.status(200).json({message:"Book Returned Successfully...",payload:user?.return_books})
                        }
                    }
                }
            }
        }
    }

}

//--------------------- User Logout----------------------
export const userLogout=async(req:Request,res:Response)=>{
    // clear token 
    res.clearCookie("token",{
        httpOnly:true,
        sameSite:"none",
        secure:true,
        maxAge:7*24*60*60*1000,
    })

    // send response
    res.status(200).json({message:"Logout successful"})
}

// -------------------- Borrow Cart Multiple books----------------
export const borrowCartBooks=async(req:Request,res:Response)=>{
    // get user id from the req obj
    let uid=(req as any).user["_id"]
    // let uid="6903434be6fdb6034cbc1655"
    // check user existance
    let userObj=await UserModel.findById(uid)
    if(userObj===null){
        res.status(401).json({message:"Invalid User"})
    }
    else{
        // get user cart books
        let cartBooks:[]=req.body["books"] || [] //if data not received
        // check cart length 
        if(!cartBooks.length) {
            res.status(409).json({message:"cart is Empty.."})
        }
        const BORROW_BOOKS_COUNT=userObj.borrowed_books?.length
        const BORROW_LIMIT=4
        // const CART_COUNT=4
        // check borrow limit
        if(BORROW_BOOKS_COUNT && BORROW_BOOKS_COUNT>=BORROW_LIMIT){
            res.status(409).json({message:`Please Return Some Books To Borrow New Books...`})
        }
        else{
            // check books whether anyone of them already borrowed or not
            // let cartBorrowedBooks=userObj.borrowed_books?.filter(book=>cartBooks?.filter(cartObj=>cartObj===book.bookId))
            // let cartBorrowedBooks = userObj.borrowed_books?.filter(borrowedBook =>cartBooks?.includes(borrowedBook.bookId))
            let borrowedBookIds=userObj.borrowed_books?.map(obj=>obj.bookId.toString()) || []

            let cartBorrowedBooks=cartBooks?.filter(bookId=>borrowedBookIds.includes(bookId));          

            const books=await BookModel.find({_id:{$in:cartBooks}})

            // check book availability
            let bookAvailabilityStatus=books.filter(book=>book.availability<=0)
            let bookNames=bookAvailabilityStatus.map(obj=>obj.title)
            if(bookAvailabilityStatus.length!==0){
                res.status(409).json({message:`These book are unvailable ${bookNames},please discard them or choose other books..`})
            }
            else{
                // check length of cartBorrowed books
                if(cartBorrowedBooks && cartBorrowedBooks?.length>0){
                    const booksNames=books.map(book=>book.title)
                    res.status(409).json({message:`${booksNames} these books are already borrowed, so you cannot borrow them again, remove them to borrow remaining one's..`})
                }
                else{
                    let newBooksToBorrow=cartBooks.filter(bookId=>!borrowedBookIds.includes(bookId))
                    if(BORROW_BOOKS_COUNT && BORROW_BOOKS_COUNT + newBooksToBorrow.length > BORROW_LIMIT){
                        let canBorrow=BORROW_LIMIT-BORROW_BOOKS_COUNT
                        if(canBorrow>0){
                            res.status(409).json({message:`you can only borrow ${canBorrow} Books..`})
                        }
                        else{
                            res.status(409).json({message:"Return already Borrowed Books To Borrow all cart Books.."})
                        }
                    }
                    else{
                        // borrow all book which are in cart
                        let borrowBooksArray=newBooksToBorrow.map(bookId=>{
                            // borrow book
                            const today=new Date()
                            const due_Date=new Date()
                            due_Date.setDate(today.getDate()+7)
                            // create borrow book object along with details
                            let borrowBookObj={
                                bookId:bookId,
                                borrowDate:today,
                                dueDate:due_Date,
                                fine:0
                            }
                            return borrowBookObj      
                        })
                        // update database with borrow books and book availability
                        let bookAvailabilityUpdateStatus=await BookModel.updateMany({_id:{$in:newBooksToBorrow}},{$inc:{availability:-1}})
                        let userBorrowStatus=await UserModel.updateOne({_id:uid},{$push:{borrowed_books:{$each:borrowBooksArray}}})
                        if(bookAvailabilityUpdateStatus.modifiedCount!==0 && userBorrowStatus.modifiedCount!==0){
                            let user=await UserModel.findById(uid)
                            res.status(200).json({message:"Books Borrowed Successfully..",payload:user?.borrowed_books})
                        }
                        else{
                            res.status(500).json({message:"Error occured while borrowing books,try again..."})
                        }

                    }
                }
            }
        }
        
    }

}


 