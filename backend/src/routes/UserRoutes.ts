import {Router} from 'express'
import { addNewUser, addToCart, borrowBook, borrowCartBooks, loginUser, readAllUsers, removeFromCart, returnBook, updateUser, userLogout } from '../controllers/UserControllers'
import expressAsyncHandler from 'express-async-handler'
import { verifyToken } from '../middlewares/verifyToken'
// create router
export const UserRoute=Router()

// add new user 
UserRoute.post('/user',expressAsyncHandler(addNewUser))

// login user 
UserRoute.post("/userLogin",expressAsyncHandler(loginUser))

// read all the users details
UserRoute.get("/users",expressAsyncHandler(readAllUsers))

// update user data
UserRoute.put("/update-user",verifyToken,expressAsyncHandler(updateUser))

// add book to user cart
UserRoute.put("/cartAdd",verifyToken,expressAsyncHandler(addToCart))

// remove book from usercart
UserRoute.put("/cartRemove",verifyToken,expressAsyncHandler(removeFromCart))

// borrow book 
UserRoute.put("/borrow-book",verifyToken,expressAsyncHandler(borrowBook))

// return book
UserRoute.put("/return-book",verifyToken,expressAsyncHandler(returnBook))

// logout user
UserRoute.get("/user-logout",expressAsyncHandler(userLogout))

// Borrow Cart Books
UserRoute.put("/borrow-cart-books",verifyToken,expressAsyncHandler(borrowCartBooks))