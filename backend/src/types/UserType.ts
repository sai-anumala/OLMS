import { BorrowedBookType, ReturnBookType } from "./BookType";
// user type
export type UserType={
  _id?: string;
  username: string;
  mobile:string;
  email: string;
  password: string;
  role: string;
  fine?: number;
  cart?: string[];
  borrowed_books?: BorrowedBookType[];
  status:boolean;
  return_books?:ReturnBookType[]
};

