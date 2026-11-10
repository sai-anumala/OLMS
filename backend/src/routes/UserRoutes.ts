import { Router } from 'express'
import { addNewUser, addToCart, borrowBook, borrowCartBooks, loginUser, readAllUsers, removeFromCart, returnBook, updateUser, userLogout } from '../controllers/UserControllers'
import expressAsyncHandler from 'express-async-handler'
import { isAdmin, verifyToken } from '../middlewares/verifyToken'
import { rateLimit } from '../middlewares/rateLimit'

export const UserRoute = Router()

// slow down password guessing / mass sign-ups
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })

// add new user
UserRoute.post('/user', authLimiter, expressAsyncHandler(addNewUser))

// login user
UserRoute.post("/userLogin", authLimiter, expressAsyncHandler(loginUser))

// read all the users details (admin only)
UserRoute.get("/users", verifyToken, isAdmin, expressAsyncHandler(readAllUsers))

// update own profile
UserRoute.put("/update-user", verifyToken, expressAsyncHandler(updateUser))

// add book to user cart
UserRoute.put("/cartAdd", verifyToken, expressAsyncHandler(addToCart))

// remove book from user cart
UserRoute.put("/cartRemove", verifyToken, expressAsyncHandler(removeFromCart))

// borrow book
UserRoute.put("/borrow-book", verifyToken, expressAsyncHandler(borrowBook))

// return book
UserRoute.put("/return-book", verifyToken, expressAsyncHandler(returnBook))

// logout user
UserRoute.get("/user-logout", expressAsyncHandler(userLogout))

// Borrow Cart Books
UserRoute.put("/borrow-cart-books", verifyToken, expressAsyncHandler(borrowCartBooks))
