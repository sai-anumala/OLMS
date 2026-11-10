import type { BookSummaryType, BookType } from "./BookType";

// borrowed book data (fine, overdue and book are filled in by the server)
export type BorrowedBookType={
  bookId?: string ; //api response type and normal type
  fine: number;
  borrowDate: string;
  dueDate: string;
  overdue?: boolean;
  book?: BookSummaryType | null;
};

// returned book data
export type ReturnBookType = {
  bookId: string;
  fine: number;
  borrowDate: string;
  returnDate: string;
  method?:string,
  transactionId?:string
  paymentId?:string // Razorpay payment id (pay_...)
  book?: BookSummaryType | null;
};

// numbers for the user dashboard, calculated by the server
export type UserSummaryType = {
  borrowedCount: number;
  overdueCount: number;
  totalFine: number;
  borrowLimit: number;
  remainingBorrows: number;
};

// user type
export type UserType = {
  _id?: string;
  username: string;
  mobile: string;
  email: string;
  password?: string; //optional --> (for registration:required (or) for api response:not required)
  role: string;
  status?: boolean; // false = account on hold
  cart: string[] ; // BookType[] for api response (if populated)
  fine?: number;
  borrowed_books?: BorrowedBookType[];
  return_books?:ReturnBookType[];
  cart_books?: BookType[]; // full details of the books in `cart`
  summary?: UserSummaryType;
};


// context
export type UsersContextType = {
  users: UserType[];
  updateUserInfo:( userData:UserType)=>void;
  deleteUser:(userId:string)=>void;
  holdUser:(userId:string)=>void;
  // cartBooksBorrow:(books:string[])=>void
};
