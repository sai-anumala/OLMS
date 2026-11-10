import { apiRequest } from "./api";
import type { LoginType } from "../types/AuthContextType";
import type { UserType } from "../types/UserType";

export const registerUser = (user: Pick<UserType, "username" | "email" | "mobile" | "password">) =>
  apiRequest("/user-api/user", "POST", user);
export const loginUser = (credentials: LoginType) => apiRequest("/user-api/userLogin", "POST", credentials);
export const logoutUser = () => apiRequest("/user-api/user-logout");
export const refreshSession = () => apiRequest("/refresh");

// only the editable profile fields are sent; the server uses the session, not an id
export const updateProfile = ({ username, email, mobile, password }: Partial<UserType>) =>
  apiRequest("/user-api/update-user", "PUT", { username, email, mobile, ...(password && { password }) });

export const addToCart = (bookId: string) => apiRequest("/user-api/cartAdd", "PUT", { bookId });
export const removeFromCart = (bookId: string) => apiRequest("/user-api/cartRemove", "PUT", { bookId });
export const borrowBook = (bookId: string) => apiRequest("/user-api/borrow-book", "PUT", { bookId });
export const borrowCartBooks = (books: string[]) => apiRequest("/user-api/borrow-cart-books", "PUT", { books });
export const returnBook = (bookId: string) => apiRequest("/user-api/return-book", "PUT", { bookId });
