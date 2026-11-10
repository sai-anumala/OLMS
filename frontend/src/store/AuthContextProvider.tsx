import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { AuthContextType, LoginType } from '../types/AuthContextType';
import type { UserType } from '../types/UserType';
import type { PaymentFormType } from '../types/FineType';
import type { ApiResult } from '../services/api';
import * as userApi from '../services/user';
import { payFine as payFineApi } from '../services/transaction';
import { useBooks } from './BooksContext';

const AuthContext = createContext<AuthContextType | null>(null);

// Session state: the server returns the updated user after every action, so we just store it
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { fetchingBooks } = useBooks();

  // store the returned user and show the server's message; optionally reload the catalog counts
  const applyUserResult = (res: ApiResult, { reloadBooks = false } = {}) => {
    if (res.status === 200) {
      if (res.data.payload) setCurrentUser(res.data.payload as UserType);
      toast.success(res.data.message);
      if (reloadBooks) fetchingBooks();
    } else {
      toast.error(res.data.message);
    }
  };

  const userLogin = async (credentials: LoginType) => {
    setIsLoading(true);
    const res = await userApi.loginUser(credentials);
    setIsLoading(false);
    if (res.status === 200) {
      setCurrentUser(res.data.payload as UserType);
      setLoginError(null);
      toast.success(res.data.message);
    } else {
      setCurrentUser(null);
      setLoginError(res.data.message);
    }
  };

  const userLogout = async () => {
    const res = await userApi.logoutUser();
    if (res.status !== 200) {
      toast.error("logout failed try again");
      return;
    }
    toast.success(res.data.message);
    setCurrentUser(null);
  };

  // restore the session after a page refresh; 401 just means "not logged in"
  const refreshPage = async () => {
    const res = await userApi.refreshSession();
    if (res.status === 200) setCurrentUser(res.data.payload as UserType);
    else if (res.status === 403 || res.status === 0) toast.error(res.data.message);
    setPageLoading(false);
  };

  const updateUser = async (user: UserType) => applyUserResult(await userApi.updateProfile(user));
  const bookAddToCart = async (bookId: string) => applyUserResult(await userApi.addToCart(bookId));
  const bookRemoveFromCart = async (bookId: string) => applyUserResult(await userApi.removeFromCart(bookId));
  const bookBorrow = async (bookId: string) =>
    applyUserResult(await userApi.borrowBook(bookId), { reloadBooks: true });
  const cartBooksBorrow = async (books: string[]) =>
    applyUserResult(await userApi.borrowCartBooks(books), { reloadBooks: true });
  const returnBook = async (bookId: string) =>
    applyUserResult(await userApi.returnBook(bookId), { reloadBooks: true });
  const payFine = async (payment: PaymentFormType) =>
    applyUserResult(await payFineApi(payment), { reloadBooks: true });

  useEffect(() => {
    refreshPage();
  }, []);

  const contextValue = useMemo(() => ({
    currentUser,
    isLoading,
    loginError,
    loginStatus: currentUser !== null,
    pageLoading,
    userLogin,
    userLogout,
    updateUser,
    bookAddToCart,
    bookRemoveFromCart,
    bookBorrow,
    returnBook,
    cartBooksBorrow,
    payFine,
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers only use state setters
  }), [currentUser, isLoading, loginError, pageLoading]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives with its provider
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthContextProvider');
  return context;
};

export default AuthContextProvider;
