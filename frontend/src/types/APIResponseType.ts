import type { BookType } from "./BookType";
import type { DashboardType, TransactionRowType } from "./AdminType";
import type { TransactionFormType } from "./FineType";
import type { BorrowedBookType, ReturnBookType, UserType } from "./UserType";

export type APIResponseType={
    message:string;
    reply?:string; // chatbot answer
    payload?:UserType | BookType | UserType[] | BookType[] | BorrowedBookType | BorrowedBookType[] | ReturnBookType | ReturnBookType[] | TransactionFormType | TransactionFormType[] | DashboardType | TransactionRowType[] | null ;
}
