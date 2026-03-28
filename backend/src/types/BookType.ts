export type BookType={
    _id?:string,
    title:string,
    author:string,
    image:string,
    rating:number;
    availability:number;
    description:string;
    isbn:string;
    pages:number;
    genre:string;
    copies?:number;
    published:string;  
    status:boolean;
    isDelete:boolean;
}

// borrowed book data
export type BorrowedBookType = {
  bookId: string;
  fine: number;
  borrowDate: string;
  dueDate: string;
};

// return book type
export type ReturnBookType = {
  bookId: string;
  fine: number;
  borrowDate: string;
  returnDate: string;
  method?:string,
  transactionId?:string
};