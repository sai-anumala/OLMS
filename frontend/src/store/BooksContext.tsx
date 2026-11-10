import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { BooksContextType, ContextPropsType } from "../types/BookContext";
import type { BookType } from "../types/BookType";
import type { ApiResult } from "../services/api";
import * as bookApi from "../services/book";

const booksContextObj = createContext<BooksContextType | null>(null);

// Books state; the server is the source of truth, so lists are reloaded after every change
function BooksProvider({ children }: ContextPropsType) {
  const [books, setBooks] = useState<BookType[]>([]);
  const [managedBooks, setManagedBooks] = useState<BookType[]>([]);
  const managedLoaded = useRef(false); // reload the admin list only once an admin page used it

  const loadInto = async (request: Promise<ApiResult>, setter: (books: BookType[]) => void) => {
    const res = await request;
    if (res.status === 200 && Array.isArray(res.data.payload)) setter(res.data.payload as BookType[]);
    else toast.error(res.data.message || "Failed to load books. Please try again.");
  };

  const fetchingBooks = () => loadInto(bookApi.getCatalogBooks(), setBooks);
  const fetchManagedBooks = () => {
    managedLoaded.current = true;
    return loadInto(bookApi.getManagedBooks(), setManagedBooks);
  };

  // show the server's message and reload both lists on success
  const runAdminAction = async (request: Promise<ApiResult>, okStatus = 200) => {
    const res = await request;
    if (res.status !== okStatus) {
      toast.error(res.data.message);
      return false;
    }
    toast.success(res.data.message);
    await Promise.all([fetchingBooks(), managedLoaded.current && fetchManagedBooks()]);
    return true;
  };

  const addNewBook = (book: BookType) => runAdminAction(bookApi.addBook(book), 201);
  const updateBook = (book: BookType) => runAdminAction(bookApi.updateBook(book));
  const deleteBook = (bookId: string) => runAdminAction(bookApi.toggleBookRemoved(bookId));
  const updateBookStatus = (bookId: string) => runAdminAction(bookApi.toggleBookStatus(bookId));

  useEffect(() => {
    fetchingBooks();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load the catalog once
  }, []);

  const contextValue = useMemo(() => ({
    books, managedBooks, fetchingBooks, fetchManagedBooks, addNewBook, updateBook, deleteBook, updateBookStatus,
  // eslint-disable-next-line react-hooks/exhaustive-deps -- functions only use setters and a ref
  }), [books, managedBooks]);

  return <booksContextObj.Provider value={contextValue}>{children}</booksContextObj.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives with its provider
export const useBooks = () => {
  const context = useContext(booksContextObj);
  if (!context) throw new Error("useBooks must be used within a BooksProvider");
  return context;
};

export default BooksProvider;
