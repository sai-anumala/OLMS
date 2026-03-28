import  { useState, useEffect } from 'react';
import { fetchBooks } from "../../store/BooksContext";
import { fetchUsers } from "../../store/UserContext";

type BorrowedItem ={
  author:string ;
  bookImage:string;
  bookTitle:string;
  borrowerName:string;
  borrowerId:string;
  dueDate:string;
  fine:number;
}

function BorrowedBooks() {

    const [borrowedData, setBorrowedData]=useState<BorrowedItem[]>([]);
    
    // getting books and users data
    const { users }=fetchUsers() 
    const { books }=fetchBooks() 
    
    useEffect(()=>{
        if (!users || !books ) {
            setBorrowedData([])
        }
        
        const BorrowedArrays=users.map(user=>{
            if(user.borrowed_books){ 
               return user.borrowed_books
                .filter(record=>record.bookId && record.bookId.length>0) 
                .map(record=>{
                    const bookDetails=books.find(book=>book._id===record.bookId)
                    if (bookDetails) {
                        return {
                            author: bookDetails.author,
                            bookImage: bookDetails.image,
                            bookTitle: bookDetails.title,
                            borrowerName: user.username,
                            borrowerId: user._id,
                            dueDate: record.dueDate,
                            fine: record.fine,
                        };
                    }
                    return null; 
                }).filter((item):item is BorrowedItem=>item!==undefined);
            }
            else{
                return []
            }
        });

        // final borrowed list of users
         const finalBorrowedList=BorrowedArrays.reduce((acc,borrowArr)=>[...acc,...borrowArr],[]);  
        setBorrowedData(finalBorrowedList)
    },[users,books]);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Currently Borrowed Books ({borrowedData.length})</h2>
            <hr />

            {borrowedData.length===0 ?(
                <div className="alert alert-success">No books are currently checked out.</div>
            ):(
                <div>
                    {borrowedData.map((item) => (
                        
                        <div key={item.borrowerId} className="border mb-1 d-flex align-items-center justify-content-between p-3">
                            <div className="d-flex align-items-center flex-grow-1">
                                <img 
                                    src={item.bookImage} 
                                    alt={item.bookTitle} 
                                    style={{ width:'80px',height:'80px',objectFit:'cover',marginRight:'20px'}}/>
                                <div>
                                    <strong className="d-block">{item.bookTitle}</strong> 
                                    <p className="text-muted mb-0 small">Author: {item.author}</p>
                                </div>
                            </div>

                            <div className="text-end">
                                <p className="mb-1">Borrowed by: <strong className="text-primary">{item.borrowerName}</strong></p>
                                <p className="mb-0 small text-muted">Due Date: {new Date(item.dueDate).toLocaleDateString()}</p>
                                {item.fine>0 && (
                                    <p className="mb-0  text-danger fw-bold">Fine: ₹ {item.fine.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BorrowedBooks;