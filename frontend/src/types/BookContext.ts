import type { ReactNode } from "react";
import type { BookType } from "./BookType";


// context
export type BooksContextType = {
  books: BookType[]; 
  fetchingBooks:()=>void
  addNewBook:(newBookData:BookType)=>void;
  deleteBook:(bookId:string)=>void;
  updateBook:(bookData:BookType)=>void;
  updateBookStatus:(bookId:string)=>void;
};

export type ContextPropsType={
    children:ReactNode;
}