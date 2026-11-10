// import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthContextType, LoginType } from '../types/AuthContextType';
import type { UserType } from '../types/UserType';
import { loginUser } from '../services/user/Login';
import { addToCart, removeFromCart } from '../services/user/CartApi';
import { borrowBook } from '../services/user/BorrowBook';
import { useBooks } from './BooksContext';
import toast from 'react-hot-toast';
import { returnBookApi } from '../services/user/ReturnBook';
import { updateProfile } from '../services/common/UpdateUser';
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

  const {fetchingBooks}=useBooks()
  
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
    const resObj=await addToCart(bookId)
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
    const resObj=await removeFromCart(bookId)

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
    const resObj=await borrowBook(bookId)
    if(resObj.status===200){
      // server sends back the updated user (borrowed books, cart and fines)
      setCurrentUser(resObj.data.payload as UserType)
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
    const resObj=await returnBookApi(bookId)
    // check status
    if(resObj.status===200){
      setCurrentUser(resObj.data.payload as UserType) // updated borrowed + returned books from the server
      toast.success(resObj.data.message) 
      fetchingBooks() // to maintain books count consistant across the components
    }
    else{
      toast.error(resObj.data.message)
    }
  }

  // function to update the user data
  const updateUser=async (userData:UserType):Promise<void>=>{
     const resObj=await updateProfile(userData)
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
        const res=await fetch(`${import.meta.env.VITE_API_URL}/refresh`,{
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
          // 401 just means the visitor isn't logged in; 403 means the account is on hold
          if(res.status===403) toast.error(resObj.message)
          setCurrentUser(null)
          setLoginStatus(false)
        } 
    }catch{
      toast.error("Could not reach the server. Please try again later.");
      setLoginStatus(false);
    }
    finally{
      setPageLoading(false)
    }
  }

// ----------------------user logout---------------------
  const userLogout=async():Promise<void>=> {
    try{
      const res=await fetch(`${import.meta.env.VITE_API_URL}/user-api/user-logout`,{
        method:"GET",
        credentials:"include"
      })
      const resObj=await res.json()
      if(res.status!==200){
        toast.error("logout failed try again")
        return
      }
      toast.success(resObj.message)
      setCurrentUser(null);
      setLoginStatus(false)
    }catch{
      toast.error("logout failed try again")
    }
  }

  // ------------------Cart Books Borrow--------------
  const cartBooksBorrow=async(books:string[])=>{
        const resObj=await cartBorrowBooks(books)
        if(resObj.status===200){
            // server returns the full updated user (borrowed books added, cart emptied)
            setCurrentUser(resObj.data.payload as UserType)
            toast.success(resObj.data.message)
            fetchingBooks()
        }
        else{
            toast.error(resObj.data.message)
        }
   }

  //  ---------------PAY Fine Book---------------------
  const payFine=async(fineDetails:PaymentFormType)=>{
    let resObj
    try{
      resObj=await payFineAPi(fineDetails)
    }catch{
      toast.error("Payment failed, please try again")
      return
    }
    if(resObj.status===200){
      setCurrentUser(resObj.data.payload as UserType)
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
  // the handlers only use state setters, so re-creating the value when state changes is enough
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
