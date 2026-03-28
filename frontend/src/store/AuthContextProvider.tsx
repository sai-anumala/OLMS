// import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthContextType, LoginType } from '../types/AuthContextType';
import type {  BorrowedBookType, ReturnBookType, UserType } from '../types/UserType';
import { loginUser } from '../services/user/Login';
import { addToCart, removeFromCart } from '../services/user/CartApi';
import { borrowBook } from '../services/user/BorrowBook';
import { fetchBooks } from './BooksContext';
import toast from 'react-hot-toast';
import { returnBookApi } from '../services/user/ReturnBook';
import { updateUserDetails } from '../services/common/UpdateUser';
import { cartBorrowBooks } from '../services/user/BorrowCartBooks';
// import type { PaymentFormType } from '../types/FineType';
import { payFineAPi } from '../services/user/PayFine';
import type { PaymentFormType } from '../types/FineType';

// Create the context object with a clear name.
export const AuthContext = createContext<AuthContextType | null>(null);

// Create the provider component.
export function AuthContextProvider({children}: {children:ReactNode}) {

  // state variables for managing user authentication & sesions
  const [currentUser, setCurrentUser]=useState<UserType | null>(null);
  const [isLoading, setIsLoading]=useState<boolean>(false);
  const [loginError, setLoginError]=useState<string | null>(null);
  const [loginStatus,setLoginStatus]=useState<boolean>(false)
  const [pageLoading,setPageLoading]=useState<boolean>(true)

  const {fetchingBooks}=fetchBooks()
  
// ------------------------------- Login -------------------------------
  const userLogin=async(userData:LoginType):Promise<void>=>{
    try{
      setIsLoading(true)
      const resObj=await loginUser(userData)

      // check response
      if(resObj.status===200){
        setCurrentUser(resObj.data.payload as UserType)
        setLoginStatus(true)
        setLoginError(null)
        setIsLoading(false)
        toast.success(resObj.data.message,{
          position:'top-center'
        })
      }
      // if response is not equal to 200
      else{
        setLoginError(resObj.data.message)  // login error message
        setCurrentUser(null)
        setLoginStatus(false)
        setIsLoading(false)
      }
    }catch(err: unknown){
      if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        setLoginError("An unknown error occurred");
      }
      setCurrentUser(null);
      setLoginStatus(false)
    } finally{
      setIsLoading(false);
    }
  }

// ------------------------------- Cart Handler--------------------------
  //--------------------------- Add Book To Cart-------------------------
  const bookAddToCart=async(bookId:string):Promise<void>=>{
    // pass book details to it
    let resObj=await addToCart(bookId)
    if(resObj.status===200) {
      setCurrentUser(prev=>prev && {...prev,cart:[...prev.cart,bookId]})
      // return resObj.data.message
      toast.success(resObj.data.message)
    }
    else{
      toast.error(resObj.data.message)
      // return resObj.data.message
    }
  }

  //--------------------------Remove Book Fromn Cart----------------------
  const bookRemoveFromCart=async(bookId:string):Promise<void>=>{
    // pass book details to it
    let resObj=await removeFromCart(bookId)

    // check status
    if(resObj.status===200){
      setCurrentUser(prev=>prev && {...prev,cart:prev.cart.filter(book=>book!==bookId)})
      // return resObj.data.message
      toast.success(resObj.data.message)
    }
    else{
      // return resObj.data.message  //cart error mesage
      toast.error(resObj.data.message)
    }
  }

// ----------------------------- Borrow Book ----------------------------
  const bookBorrow=async(bookId:string):Promise<void>=>{
    let resObj=await borrowBook(bookId)
    if(resObj.status===200){
      // setCurrentUser(prev=>prev && {...prev,borrowed_books:[...(prev.borrowed_books || []),...(resObj.data.payload as BorrowedBookType[])]})
      setCurrentUser(prev=>prev && {...prev,borrowed_books:(resObj.data.payload as BorrowedBookType[])})
      // call books api
      fetchingBooks()
      toast.success(resObj.data.message)
    }
    else{
      toast.error(resObj.data.message)
    }
  }

// ----------------------------- Return Book ---------------------------
  const returnBook=async(bookId:string):Promise<void>=>{
    let resObj=await returnBookApi(bookId)
    // check status
    if(resObj.status===200){
      setCurrentUser(prev=>prev && {...prev,borrowed_books:prev.borrowed_books?.filter(obj=>obj.bookId!==bookId),return_books:(resObj.data.payload as ReturnBookType[])}) // updating local use stsate of borroweed books and retunred books
      toast.success(resObj.data.message) 
      fetchingBooks() // to maintain books count consistant across the components
    }
    else{
      toast.error(resObj.data.message)
    }
  }

  // function to update the user data
  const updateUser=async (userData:UserType):Promise<void>=>{
     let resObj=await updateUserDetails(userData)
     if(resObj.status===200){
      toast.success(resObj.data.message)
      setCurrentUser(prev=>prev && {...prev,...resObj.data.payload})
     }
     else{
        toast.error(resObj.data.message)
     }
      
  }

//------------------ page refresh ----------------------
  const refreshPage=async():Promise<void>=>{
    try{
          // make client request
        let res=await fetch(`${import.meta.env.VITE_API_URL}/refresh`,{
          method:"GET",
          credentials:"include"
          })
        // parse response
        const resObj=await res.json()
        // check response status
        if(res.status===200){ 
          setCurrentUser(resObj.payload)
          setLoginStatus(true)
        }
        else{
          toast.error("page not refreshed")
          setLoginStatus(false)
        } 
    }catch(err){
      toast.error("Session expired. Please login again.");
      setLoginStatus(false);
    }
    finally{
      setPageLoading(false)
    }
  }

// ----------------------user logout---------------------
  const userLogout=async():Promise<void>=> {
    // make req
    let res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/user-logout`,{
      method:"GET",
      credentials:"include"
    })
    let resObj=await res.json()
    // check res
    if(res.status!==200){
       toast.error("logout failed try again")
    }
   else{
      toast.success(resObj.message)
    setCurrentUser(null);
    setLoginStatus(false)
    }
  }

  // ------------------Cart Books Borrow--------------
  const cartBooksBorrow=async(books:string[])=>{
        let resObj=await cartBorrowBooks(books)
        if(resObj.status===200){
            setCurrentUser(prevUser=>prevUser && ({
              ...prevUser,
              borrowed_books:[...prevUser?.borrowed_books || [], ...(resObj.data.payload as BorrowedBookType[])]}))
            toast.success(resObj.data.message)
            fetchingBooks()
        }
        else{
            toast.error(resObj.data.message)
        }
   }

  //  ---------------PAY Fine Book---------------------
  const payFine=async(fineDetails:PaymentFormType)=>{
    let resObj=await payFineAPi(fineDetails)
    if(resObj.status===200){
      setCurrentUser(prevUser=>prevUser && {...prevUser,borrowed_books:(resObj.data.payload as UserType).borrowed_books,return_books:(resObj.data.payload as UserType).return_books})
      toast.success(resObj.data.message)
      fetchingBooks()
    }
    else{
      toast.error(resObj.data.message)
    }
  }

  //  const payFine=async(fineDetails:string)=>{
  //   let resObj=await payFineAPi(fineDetails)
  //   if(resObj.status===200){
  //     setCurrentUser(prev=>prev && {...prev,borrowed_books:prev.borrowed_books?.filter(obj=>obj.bookId!==fineDetails)})
  //     toast.success(resObj.data.message) 
  //     fetchingBooks() // to maintain books count consistant across the components
  //   }
  //   else{
  //     toast.error(resObj.data.message)
  //   }
  // }
  
// ------ whenever the page refreshes to store the current user details-------------
  useEffect(()=>{
    refreshPage()
  },[])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentUser,
    isLoading,
    loginError,
    loginStatus,
    userLogin,
    userLogout,
    updateUser,
    bookAddToCart,
    bookRemoveFromCart,
    bookBorrow,
    returnBook,
    cartBooksBorrow,
    payFine,
    pageLoading
  }), [currentUser, isLoading, loginError, loginStatus, pageLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 

// Custom hook should be defined outside the component.
export const useAuth=():AuthContextType => {
  const context=useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

export default AuthContextProvider;
