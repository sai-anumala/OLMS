import {Router} from 'express'
import expressAsyncHandler from 'express-async-handler'
import { deleteUser, holdUser, updateUserData } from '../controllers/AdminController'
// import { verifyToken } from '../middlewares/verifyToken'

// create server
export const AdminRoute=Router()

// update user(member) data
AdminRoute.put("/update-user",expressAsyncHandler(updateUserData))

// hold user 
AdminRoute.put("/hold-user",expressAsyncHandler(holdUser))

// delete user
AdminRoute.put("/delete-user",expressAsyncHandler(deleteUser))