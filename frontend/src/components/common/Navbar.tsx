import { BiSearch } from "react-icons/bi";
import { FaBook } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/AuthContextProvider";
import { CgProfile } from "react-icons/cg";
import { SlBasketLoaded } from "react-icons/sl";
import { SiBookstack } from "react-icons/si";
import { useSearchTermContext } from "../../store/SearchContext";
import { useState } from "react";
import "../../css/Navbar.css"
// Define props for the Navbar component
type NavbarProps={
  handleOpenProfile: () => void;
};

function Navbar({ handleOpenProfile }:NavbarProps) {
  // state to control navbar
  const [isNavOpen,setIsNavOpen]=useState<boolean>(false)
  const { currentUser }=useAuth();
  const { searchTerm,setSearchTerm }=useSearchTermContext();

  return (
    <div className="navigation shadow-sm">
      <nav className={`navbar navbar-expand-sm navbar-light bg-light ps-2 ${currentUser?.role==="user" ? "p-1" : "p-4"}`}>
        <div className="container-fluid">

          {/* Logo and App Name */}
          <NavLink to="books" className="no-link-style d-flex align-items-center ms-5"><FaBook size={30} className="text-dark me-2" /><span className="fs-4 fw-bold">OLMS</span></NavLink>

            {/* Toggler */}
            <button
              className="navbar-toggler me-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#nav-small-screen"
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
              {/* Navbar Content */}
            <div className={`navbar-collapse ${isNavOpen ? "show" : "collapse"}`} id="nav-small-screen"><br />
              {/* Search Bar */}
              <div className="input-group mx-auto" style={{maxWidth:"28rem"}}>
                <span className="input-group">
                  <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
                    <input type="text" id="search" value={searchTerm} className="form-control border border-start-0 rounded-end-3" placeholder="Search by Bookname, author, title..." onChange={(e) => setSearchTerm(e.target.value)}/>
                  </span>
              </div>
            
            <br />
          {/* Navigation Links (Conditional Rendering) */}
          {currentUser ? (
            currentUser.role==="user" ? (
              <div className="d-flex gap-4 align-items-center mx-auto p-4">
                <NavLink className="nav-link" to="/user/dashboard">Dashboard</NavLink>
                <NavLink className="nav-link" to="/user/my-books">My Books <SiBookstack className="fs-5" /></NavLink>
                <NavLink className="nav-link" to="/user/cart"> Cart <SlBasketLoaded className="fs-5" /></NavLink>
                <NavLink className="nav-link me-3" to="" onClick={handleOpenProfile} aria-label="Profile"><CgProfile className="text-bold d-block fs-3 ms-3" /></NavLink>
              </div>

            ) : (
              // Admin Links
              <div className="d-flex align-items-center gap-4 mx-auto">
                <NavLink className="nav-link" to="/admin/dashboard">Dashboard</NavLink>
                <NavLink className="nav-link" to="/admin/members">Members</NavLink>
                <NavLink className="nav-link" to="/admin/booklist">Books</NavLink>
                <NavLink className="nav-link" to="/admin/transactions">Transactions</NavLink>
                <NavLink className="nav-link" to="" onClick={handleOpenProfile}>Profile</NavLink>
              </div>
            )
          ) : (
            // public links
            <div className="d-flex gap-2">
              <NavLink to="login"><button className="btn btn-light">Login</button></NavLink>
              <NavLink to="register"><button className="btn btn-dark text-white">SignUp</button></NavLink>
            </div>
          )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;