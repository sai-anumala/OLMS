import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { FaBook } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { SlBasketLoaded } from "react-icons/sl";
import { SiBookstack } from "react-icons/si";
import { useAuth } from "../../store/AuthContextProvider";
import { useSearchTermContext } from "../../store/SearchContext";

type NavbarProps = { handleOpenProfile: () => void };
type NavItem = { to: string; label: string; icon?: React.ReactNode };

const USER_LINKS: NavItem[] = [
  { to: "/user/dashboard", label: "Dashboard" },
  { to: "/user/my-books", label: "My Books", icon: <SiBookstack className="ms-1" /> },
  { to: "/user/cart", label: "Cart", icon: <SlBasketLoaded className="ms-1" /> },
];
const ADMIN_LINKS: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/booklist", label: "Books" },
  { to: "/admin/transactions", label: "Transactions" },
];

// Collapses into a menu below the lg breakpoint, so links and search never crowd on tablets
function Navbar({ handleOpenProfile }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const { searchTerm, setSearchTerm } = useSearchTermContext();
  const links = currentUser?.role === "admin" ? ADMIN_LINKS : currentUser ? USER_LINKS : [];
  const close = () => setOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-2 px-md-3 py-2">
      <div className="container-fluid">
        <NavLink to="books" className="navbar-brand d-flex align-items-center gap-2" onClick={close}>
          <FaBook size={26} className="text-dark" /><span className="fw-bold">OLMS</span>
        </NavLink>
        <button className="navbar-toggler" type="button" aria-controls="main-nav" aria-expanded={open}
          aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="main-nav">
          <div className="input-group my-2 my-lg-0 mx-lg-auto nav-search">
            <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
            <input type="search" id="search" value={searchTerm} className="form-control border-start-0"
              placeholder="Search by title, author, genre..." aria-label="Search books"
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {currentUser ? (
            <ul className="navbar-nav align-items-lg-center gap-lg-3">
              {links.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink className="nav-link d-flex align-items-center" to={link.to} onClick={close}>{link.label}{link.icon}</NavLink>
                </li>
              ))}
              <li className="nav-item">
                <button type="button" className="nav-link btn btn-link d-flex align-items-center gap-2"
                  onClick={() => { close(); handleOpenProfile(); }} aria-label="Profile">
                  <CgProfile className="fs-4" /><span className="d-lg-none">Profile</span>
                </button>
              </li>
            </ul>
          ) : (
            <div className="d-flex gap-2 pb-2 pb-lg-0">
              <NavLink to="login" className="btn btn-light flex-fill" onClick={close}>Login</NavLink>
              <NavLink to="register" className="btn btn-dark flex-fill" onClick={close}>Sign Up</NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
