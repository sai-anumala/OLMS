
import type { PaymentFormType } from "./FineType";
import type { UserType } from "./UserType";

export type LoginType={
  username:string;
  password:string;
};
export type registerType={
    username:string;
    email:string;
    dob:string;
    password:string;
    mobile:string;
}

// Defining the type for the context's value.
export type AuthContextType={
  // registerUser:(data:UserType)=>void;
  // registerStatus:boolean | null;
  currentUser:UserType | null;
  isLoading:boolean ;
  loginError:string | null;
  loginStatus:boolean;
  userLogin:(userData:LoginType)=>void;
  userLogout:()=>void;
  updateUser:(modifieduser:UserType)=>void;
  bookAddToCart:(bookId:string)=>void;
  bookRemoveFromCart:(bookId:string)=>void;
  bookBorrow:(bookId:string)=>void;
  returnBook:(bookId:string)=>void;
  cartBooksBorrow:(books:string[])=>void
  payFine:(fineDetails:PaymentFormType)=>void
  // payFine:(fineDetails:string)=>void
  pageLoading:boolean;
};