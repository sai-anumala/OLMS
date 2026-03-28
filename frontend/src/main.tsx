import "bootstrap/dist/css/bootstrap.min.css"
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BooksContext from "./store/BooksContext.tsx"
import AuthContextProvider from "./store/AuthContextProvider.tsx"
import UserContext from "./store/UserContext.tsx"
import { Toaster } from 'react-hot-toast'; 

createRoot(document.getElementById('root')!).render(
  
   <UserContext>
     <BooksContext>
      <AuthContextProvider>
        <Toaster position="top-center"  reverseOrder={false}/> 
         <App/>
        
      </AuthContextProvider>
    </BooksContext>
   </UserContext>
  
)
