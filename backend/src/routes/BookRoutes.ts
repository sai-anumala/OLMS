import { Router } from "express"
import expressAsyncHandler from "express-async-handler";
import { addNewBook, bookStatusUpate, deleteBook, readAllBooks, updateBook } from "../controllers/BookControllers";
import { isAdmin, verifyToken } from "../middlewares/verifyToken";

export const BookRoute = Router();

// read all the books (public)
BookRoute.get("/books", expressAsyncHandler(readAllBooks))

// admin only: add new book
BookRoute.post("/book", verifyToken, isAdmin, expressAsyncHandler(addNewBook))

// admin only: update book details
BookRoute.put("/update-book", verifyToken, isAdmin, expressAsyncHandler(updateBook))

// admin only: toggle active / inactive
BookRoute.put("/update-book-status", verifyToken, isAdmin, expressAsyncHandler(bookStatusUpate))

// admin only: remove / restore book (soft delete)
BookRoute.put("/delete-book", verifyToken, isAdmin, expressAsyncHandler(deleteBook))
