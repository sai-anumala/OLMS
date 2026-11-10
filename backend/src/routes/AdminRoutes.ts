import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import { dashboard, deleteUser, holdUser, updateUserData } from '../controllers/AdminController'
import { isAdmin, verifyToken } from '../middlewares/verifyToken'

export const AdminRoute = Router()

// every admin route requires a logged-in admin
AdminRoute.use(verifyToken, isAdmin)

// dashboard numbers + currently borrowed books
AdminRoute.get("/dashboard", expressAsyncHandler(dashboard))

// update user(member) data
AdminRoute.put("/update-user", expressAsyncHandler(updateUserData))

// hold / unhold user
AdminRoute.put("/hold-user", expressAsyncHandler(holdUser))

// delete user
AdminRoute.put("/delete-user", expressAsyncHandler(deleteUser))
