import {createBrowserRouter,RouterProvider} from 'react-router'
import Home from './pages/landingPage/Home'
import Login from './pages/landingPage/Login'
import Register from './pages/landingPage/Register'
import RootLayout from './components/common/RootLayout'
import UserDashBoard from './pages/userPage/UserDashBoard'
import Cart from './pages/userPage/Cart'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminDashboard from './pages/adminPage/AdminDashboard'
import Members from './pages/adminPage/Members'
import BooksList from './pages/adminPage/BooksList'
import ErrorPage from './components/common/ErrorPage'
import MyBooks from './pages/userPage/MyBooks'
import ReturnedBooks from './components/admin/ReturnedBooks'
import BorrowedBooksList from './pages/userPage/BorrowedBooksList'
import Transactions from './pages/adminPage/Transactions'
import ErrorBoundary from './components/common/ErrorBoundary'


function App() {

  // creating browser obj
  const browserObj= createBrowserRouter([
    {
      path:"/",
      element:<RootLayout/>,
      children:[
        {
          index:true,
          element:<Home/>
        },
        {
          path:"books",
          element:<Home/>
        }
        ,{
          path:"login",
          element:<Login/>,
        },
        {
          path:"register",
          element:<Register/>
        },{
                path:"*",
                element:<ErrorPage/>
              }
          ]

        },
      {
          path:"user",
          element:<ProtectedRoute><RootLayout/></ProtectedRoute>,
          children:[
            {
              path:"books",
              element:<Home/>,
            },
            {
              element:<UserDashBoard/>,
              index:true
            },
              {
                path:"dashboard",
                element:<UserDashBoard/>
              },
              {
                path:"my-books",
                element:<MyBooks/>,
                children:[
                  {
                    path:"",
                    element:<BorrowedBooksList/>
                  },
                  {
                    index:true,
                    path:"borrow-books",
                    element:<BorrowedBooksList/>
                  },
                  {
                    path:"returned-books",
                    element:<ReturnedBooks/>
                  }
                ]
              },{
                path:"cart",
                element:<Cart/>
              },{
                path:"*",
                element:<ErrorPage/>
              }]
    },
    {
      path:"admin",
      element:<ProtectedRoute><RootLayout/></ProtectedRoute>,
      children:[{
          index:true,
          element:<AdminDashboard/>
        },
        {
          path:"books",
          element:<Home/>
        },
        
        {
          path:"dashboard",
          element:<AdminDashboard/>
        },
        {
          path:"members",
          element:<Members/>
        },
      {
        path:"booklist",
        element:<BooksList/>
      },{
        path:"transactions",
        element:<Transactions/>
      },{
          path:"*",
          element:<ErrorPage/>
        }]
    }
  ])
  return (
    <ErrorBoundary>
      <div className="text-center">
         <RouterProvider router={browserObj} />
       </div>
    </ErrorBoundary>
  )
}

export default App
