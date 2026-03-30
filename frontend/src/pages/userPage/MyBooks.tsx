import { useNavigate, Outlet } from 'react-router';

import { useState } from 'react';

const MyBooks=() =>{
  const navigate=useNavigate();
  const [view,setView]=useState<boolean>(true)

  return (
    <div className="container-fluid">
      <div className="row m-5 mt-3">
        <div className="col-6">
          <button
            className={`btn btn-${view===true ? "dark" : "outline-dark"} w-100 rounded-5 ${view===true ? "bg-dark" : "border bg-white"} mb-3 mb-md-0`}
            onClick={()=>{navigate("/user/my-books/borrow-books");setView(true)}}
          >
            Borrowed Books
          </button>
        </div>
        <div className="col-6">
          <button
            className={`btn btn-${view===false ? "dark" : "outline-dark"} w-100 rounded-5 ${view===false ? "bg-dark" : "border bg-white"} mb-3 mb-md-0`}
            onClick={()=>{navigate("/user/my-books/returned-books");setView(false)}}
          >
            Returned Books
          </button>
        </div>
      </div>
     <Outlet/>

    </div>
  );
};

export default MyBooks;