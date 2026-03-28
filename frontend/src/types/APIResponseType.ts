import type { BookType } from "./BookType";
import type { TransactionFormType } from "./FineType";
import type { BorrowedBookType, ReturnBookType, UserType } from "./UserType";

export type APIResponseType={
    message:string;
    payload?:UserType | BookType | UserType[] | BookType[] | BorrowedBookType | BorrowedBookType[] | ReturnBookType | ReturnBookType[] | TransactionFormType | TransactionFormType[] | null ;
}
