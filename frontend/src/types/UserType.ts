
// borrowed book data
export type BorrowedBookType={
  bookId?: string ; //api response type and normal type
  fine: number;
  borrowDate: string;
  dueDate: string;
};

// export type ReturnBookType={
//   bookId?:string;
//   fine:number;
//   borrowDate:string;
//   returnDate:string;
// }
// return book type
export type ReturnBookType = {
  bookId: string;
  fine: number;
  borrowDate: string;
  returnDate: string;
  method?:string,
  transactionId?:string
};

// user type
export type UserType = {
  _id?: string;
  username: string;
  mobile: string;
  email: string;
  password?: string; //optional --> (for registration:required (or) for api response:not required)
  role: string;
  cart: string[] ; // BookType[] for api response (if populated)
  fine?: number;
  borrowed_books?: BorrowedBookType[];
  return_books?:ReturnBookType[];
};


// context
export type UsersContextType = {
  users: UserType[];
  updateUserInfo:( userData:UserType)=>void;
  deleteUser:(userId:string)=>void;
  // cartBooksBorrow:(books:string[])=>void
};
