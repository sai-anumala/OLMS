import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { AuthContextType, LoginType } from '../types/AuthContextType';
import type { UserType } from '../types/UserType';
import type { PaymentOrderType } from '../types/FineType';
import type { ApiResult } from '../services/api';
import * as userApi from '../services/user';
import { createPaymentOrder, reconcilePayment, verifyPayment } from '../services/transaction';
import { clearPendingOrder, loadRazorpay, openCheckout, readPendingOrder, savePendingOrder } from '../utils/razorpay';
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

  // restore the session after a page refresh
  const refreshPage = async () => {
    const res = await userApi.refreshSession();
    if (res.status === 200) setCurrentUser(res.data.payload as UserType);
    else if (res.status !== 401) toast.error(res.data.message); // 401 just means "not logged in"
    setPageLoading(false);
    // a payment was in progress when the page reloaded (common with UPI apps on mobile)
    const pendingOrder = res.status === 200 ? readPendingOrder() : null;
    if (pendingOrder) await settlePendingPayment(pendingOrder);
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

  // ask the server whether an order was paid. "error" = temporary problem (keep the order to retry later)
  const settlePendingPayment = async (orderId: string): Promise<"paid" | "unpaid" | "error"> => {
    const res = await reconcilePayment(orderId);
    if (res.status === 200) {
      clearPendingOrder();
      applyUserResult(res, { reloadBooks: true });
      return "paid";
    }
    if (res.status === 202) {
      if (res.data.payload) setCurrentUser(res.data.payload as UserType);
      return "unpaid";
    }
    if ([400, 403, 404].includes(res.status)) {
      clearPendingOrder(); // not this user's order or unknown: nothing to retry
      return "unpaid";
    }
    return "error"; // 0, 429, 5xx: retried on the next page load
  };

  // 1) server creates an order for the fine, 2) Razorpay checkout, 3) server verifies and returns the book.
  // If the browser misses the result (popup closed, verify failed), the server asks Razorpay directly.
  const payFine = async (bookId: string) => {
    const orderRes = await createPaymentOrder(bookId);
    if (orderRes.status !== 200) {
      toast.error(orderRes.data.message);
      return;
    }
    if (!(await loadRazorpay())) {
      toast.error("Could not load the payment page. Check your connection and try again.");
      return;
    }
    const order = orderRes.data.payload as PaymentOrderType;
    savePendingOrder(order.orderId);
    const outcome = await openCheckout(order);
    const toastId = toast.loading("Confirming payment...");

    if (outcome.status === "paid") {
      const res = await verifyPayment(outcome.result);
      if (res.status === 200) {
        toast.dismiss(toastId);
        clearPendingOrder();
        applyUserResult(res, { reloadBooks: true });
        return;
      }
    }
    // popup closed or verify failed: the user may still have paid (e.g. in a UPI app)
    const result = await settlePendingPayment(order.orderId);
    toast.dismiss(toastId);
    if (result === "unpaid") {
      clearPendingOrder();
      if (outcome.status === "cancelled") toast("Payment cancelled", { icon: "ℹ️" });
      else toast.error("The payment was not completed. No money was taken.");
    } else if (result === "error") {
      toast.error("We couldn't confirm the payment right now. If money was deducted, it will update when you reopen the page.");
    }
  };

  useEffect(() => {
    refreshPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- restore the session once on load
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
