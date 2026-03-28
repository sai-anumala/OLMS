import { useNavigate, Outlet } from 'react-router';

import { useState } from 'react';

const MyBooks=() =>{
  const navigate=useNavigate();
  const [view,setView]=useState<boolean>(true)

  return (
    <div className="container-fluid">
      <div className="row m-5 mt-3">
        <div className={`col  rounded-5 ${view===true ? "bg-dark" : "border bg-white"}`} onClick={()=>{navigate("/user/my-books/borrow-books"),setView(true)}}>
          <button className={`btn btn-${view===true ? "dark" : "white"} btn-ouline-none`} >
            Borrowed Books
          </button>

        </div>
        <div className={`col rounded-5 ${view===false ? "bg-dark" : "border bg-white"}`} onClick={()=>{navigate("/user/my-books/returned-books"),setView(false)}}>
          <button className={`btn btn-${view===false ? "dark" : "white"} btn-ouline-none`} >
            Returned Books
          </button>

        </div>
      </div>
     <Outlet/>

    </div>
  );
};

export default MyBooks;