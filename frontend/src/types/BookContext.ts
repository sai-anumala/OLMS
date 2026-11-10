import type { ReactNode } from "react";
import type { BookType } from "./BookType";


// context
export type BooksContextType = {
  books: BookType[];          // catalog: what readers can see (removed books excluded by the server)
  managedBooks: BookType[];   // admin list: every book, including removed ones
  fetchingBooks:()=>void
  fetchManagedBooks:()=>void
  addNewBook:(newBookData:BookType)=>void;
  deleteBook:(bookId:string)=>void;
  updateBook:(bookData:BookType)=>void;
  updateBookStatus:(bookId:string)=>void;
};

export type ContextPropsType={
    children:ReactNode;
}