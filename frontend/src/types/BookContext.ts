import type { ReactNode } from "react";
import type { BookType } from "./BookType";


// context
export type BooksContextType = {
  books: BookType[];          // catalog: what readers can see (removed books excluded by the server)
  managedBooks: BookType[];   // admin list: every book, including removed ones
  fetchingBooks: () => Promise<void>;
  fetchManagedBooks: () => Promise<void>;
  addNewBook: (book: BookType) => Promise<boolean>;
  updateBook: (book: BookType) => Promise<boolean>;
  deleteBook: (bookId: string) => Promise<boolean>;
  updateBookStatus: (bookId: string) => Promise<boolean>;
};

export type ContextPropsType={
    children:ReactNode;
}