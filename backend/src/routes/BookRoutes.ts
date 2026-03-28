import {Router} from "express"
import expressAsyncHandler from "express-async-handler";
import { addNewBook, bookStatusUpate, deleteBook, readAllBooks, updateBook } from "../controllers/BookControllers";

// create router
export const BookRoute=Router();

// read all the books 
BookRoute.get("/books",expressAsyncHandler(readAllBooks))

// add new book
BookRoute.post("/book",expressAsyncHandler(addNewBook))

// update book details
BookRoute.put("/update-book",expressAsyncHandler(updateBook))

// delete book 
BookRoute.put("/update-book-status",expressAsyncHandler(bookStatusUpate))

// delete book 
BookRoute.put("/delete-book",expressAsyncHandler(deleteBook))
