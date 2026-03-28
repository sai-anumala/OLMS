import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addBook } from "../services/admin/AddBook";
import { deleteBookInfo } from "../services/admin/DeleteBook";
import type { BooksContextType, ContextPropsType } from "../types/BookContext";
import type { BookType } from "../types/BookType";
import toast from "react-hot-toast";
import { updateBookDetails } from "../services/admin/UpdateBook";
import { updateBookStatusInfo } from "../services/admin/BookStatus";

// creating context obj
const booksContextObj=createContext<BooksContextType|null>(null)

function BooksProvider(props:ContextPropsType) {
    // usestate to store book data
    const [books,setBooks]=useState<BookType[]>([])

// ------------------------ GET ALL BOOKS-----------------------------
    async function fetchingBooks(){
        const res:Response=await fetch(`${import.meta.env.VITE_API_URL}/book-api/books`);
        if(res.ok){
            const booksData=await res.json();
            if (booksData?.payload && Array.isArray(booksData.payload)) {
                setBooks(booksData.payload);
            } else {
                toast.error("Invalid data received from server");
            }
        }
        else{
            toast.error("Failed to load books. Please try again.");
        }
    }

// -------------------------ADD NEW BOOK------------------------------
    async function addNewBook(newBookData: BookType): Promise<boolean> {
      // make api call
      const resObj = await addBook(newBookData);
      if (resObj.status === 201) {
        // adding new book along with book id to books state
        // here prevBooks give mostly recent book data
        if (resObj.data?.payload) {
          setBooks(prevBooks => [...prevBooks, resObj.data.payload as BookType]);
          toast.success(resObj.data.message);
          return Promise.resolve(true);
        } else {
          toast.error("Invalid response from server");
          return Promise.reject(new Error("Invalid response from server"));
        }
      } else {
        toast.error(resObj.data.message);
        return Promise.reject(new Error(resObj.data.message));
      }
    }

// ------------------------DELETE BOOK-------------------------------
    async function deleteBook(bookId:string){
        
        let resObj=await deleteBookInfo(bookId) // make api function call
        // checking status for 200 or 204(no content)
        if(resObj.status===200){
          setBooks(prevBooks=>prevBooks && prevBooks.map(book=>book._id===bookId ? {...book,isDelete:!book.isDelete} : book))
          toast.success(resObj.data.message)
        }
        else {
          toast.error(resObj.data.message)
        }
    }

// ------------------------UPDATE BOOK---------------------------------
    async function updateBook( modifiedBookData: BookType) {
        // make api req
        let resObj=await updateBookDetails(modifiedBookData)
        // check status
        if(resObj.status===200){
            setBooks(prev=>prev.map(book=>book._id===modifiedBookData._id ? {...book,...modifiedBookData}:book))
            toast.success(resObj.data.message)
        }
        else{
            toast.error(resObj.data.message)
        }
    }

// ---------------------- UPDATE BOOK STATUS---------------------------
    async function updateBookStatus(bookId:string){
       let resObj=await updateBookStatusInfo(bookId) // make api function call

        // checking status for 200
        if(resObj.status===200 ){
          setBooks(prevBooks=>prevBooks.map(book=>book._id===bookId ? {...book,status:!book.status} : book))
          toast.success(resObj.data.message)
        }
        else {
          toast.error(resObj.data.message)
        }
    }

//     async function updateBookAvailability(bookId:string,action:string) {
//     const book = books.find(book=>book._id===bookId);

//     if (!book) {
//         toast.error("Book not found.");
//         return false;
//     }

//     let newAvailability;
//     if (action === 'decrement') {
//         if (book.availability <= 0) {
//             toast.error(`The book "${book.title}" is out of stock.`);
//             return false;
//         }
//         newAvailability = book.availability - 1;
//     } else {
//         newAvailability = book.availability + 1;
//         toast.success("book returned successfully..")
//     }

//     const updatedBookData = { ...book, availability: newAvailability };

//     try {
//         const res = await fetch(`http://localhost:3000/books/${bookId}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(updatedBookData)
//         });

//         if (res.status === 200) {
//             const finalUpdatedBook = await res.json();
//             setBooks(prevBooks => prevBooks.map(b => b._id === bookId ? finalUpdatedBook : b));
//             return true;
//         } else {
//             toast.error(`Failed to update book stock on server. Status: ${res.status}`);
//             return false;
//         }
//     } catch (error) {
//         toast.error("Network error during book stock update.");
//         return false;
//     }
// }

// useEffect to call fetching books function after intial rendering
    useEffect(()=>{
        fetchingBooks();
    },[])

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
      books,
      addNewBook,
      deleteBook,
      updateBook,
      fetchingBooks,
      updateBookStatus
    }), [books]);

  return (
    <div>
      <booksContextObj.Provider value={contextValue}>
        {props.children}
      </booksContextObj.Provider>
    </div>
  )
}

// custom hook to reduce rewriting the useContext
export const fetchBooks=()=>{
    const context=useContext(booksContextObj);

    if (!context) { throw new Error("useBooks must be used within a BooksProvider") }
    // else no error return context
    return context;
};

export default BooksProvider;
