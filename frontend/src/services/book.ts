import { apiRequest } from "./api";
import type { BookType } from "../types/BookType";

// catalog for readers; the server filters by `search` (title, author or genre)
export const getCatalogBooks = (search = "") =>
  apiRequest(`/book-api/books${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`);

// admin only
export const getManagedBooks = () => apiRequest("/book-api/manage-books");
export const addBook = (book: BookType) => apiRequest("/book-api/book", "POST", book);
export const updateBook = (book: BookType) => apiRequest("/book-api/update-book", "PUT", book);
export const toggleBookStatus = (bookId: string) => apiRequest("/book-api/update-book-status", "PUT", { bookId });
export const toggleBookRemoved = (bookId: string) => apiRequest("/book-api/delete-book", "PUT", { bookId });
