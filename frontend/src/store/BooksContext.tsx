import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { addBook } from "../services/admin/AddBook";
import { deleteBookInfo } from "../services/admin/DeleteBook";
import type { BooksContextType, ContextPropsType } from "../types/BookContext";
import type { BookType } from "../types/BookType";
import toast from "react-hot-toast";
import { updateBookDetails } from "../services/admin/UpdateBook";
import { updateBookStatusInfo } from "../services/admin/BookStatus";
import { getCatalogBooks, getManagedBooks } from "../services/common/BooksApi";

// creating context obj
const booksContextObj=createContext<BooksContextType|null>(null)

// Books state; the server is the source of truth, so lists are reloaded after every change
function BooksProvider(props:ContextPropsType) {
    const [books,setBooks]=useState<BookType[]>([])
    const [managedBooks,setManagedBooks]=useState<BookType[]>([])
    // only reload the admin list if an admin page has asked for it
    const managedLoaded=useRef(false)

// ------------------------ CATALOG -----------------------------
    async function fetchingBooks(){
        const resObj=await getCatalogBooks()
        if(resObj.status===200 && Array.isArray(resObj.data.payload)){
            setBooks(resObj.data.payload as BookType[]);
        }
        else{
            toast.error(resObj.data.message || "Failed to load books. Please try again.");
        }
    }

// ------------------------ ADMIN LIST -----------------------------
    async function fetchManagedBooks(){
        managedLoaded.current=true
        const resObj=await getManagedBooks()
        if(resObj.status===200 && Array.isArray(resObj.data.payload)){
            setManagedBooks(resObj.data.payload as BookType[]);
        }
        else{
            toast.error(resObj.data.message);
        }
    }

    // reload everything that may have changed after an admin action
    async function reloadBooks(){
        await Promise.all([fetchingBooks(), managedLoaded.current ? fetchManagedBooks() : null])
    }

    // shows the server's message and reloads on success
    async function handleResult(resObj:{status:number,data:{message:string}}, okStatus=200){
        if(resObj.status===okStatus){
            toast.success(resObj.data.message)
            await reloadBooks()
            return true
        }
        toast.error(resObj.data.message)
        return false
    }

// -------------------------ADD NEW BOOK------------------------------
    async function addNewBook(newBookData: BookType): Promise<boolean> {
      const ok=await handleResult(await addBook(newBookData), 201)
      return ok ? Promise.resolve(true) : Promise.reject(new Error("Book not added"))
    }

// ------------------------REMOVE / RESTORE BOOK-------------------------------
    async function deleteBook(bookId:string){
        await handleResult(await deleteBookInfo(bookId))
    }

// ------------------------UPDATE BOOK---------------------------------
    async function updateBook(modifiedBookData: BookType) {
        await handleResult(await updateBookDetails(modifiedBookData))
    }

// ---------------------- UPDATE BOOK STATUS---------------------------
    async function updateBookStatus(bookId:string){
        await handleResult(await updateBookStatusInfo(bookId))
    }

// load the catalog after the first render
    useEffect(()=>{
        fetchingBooks();
    },[])

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
      books,
      managedBooks,
      addNewBook,
      deleteBook,
      updateBook,
      fetchingBooks,
      fetchManagedBooks,
      updateBookStatus
    // eslint-disable-next-line react-hooks/exhaustive-deps -- functions only use setters and a ref
    }), [books, managedBooks]);

  return (
    <div>
      <booksContextObj.Provider value={contextValue}>
        {props.children}
      </booksContextObj.Provider>
    </div>
  )
}

// custom hook to reduce rewriting the useContext
export const useBooks=()=>{
    const context=useContext(booksContextObj);

    if (!context) { throw new Error("useBooks must be used within a BooksProvider") }
    // else no error return context
    return context;
};

export default BooksProvider;
