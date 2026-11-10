import { useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaBook } from "react-icons/fa";
import {
  IoBookOutline, IoCartOutline, IoCloseCircle, IoGridOutline, IoLibraryOutline,
  IoPeopleOutline, IoReceiptOutline, IoSearch,
} from "react-icons/io5";
import { useAuth } from "../../store/AuthContextProvider";
import { useSearchTermContext } from "../../store/SearchContext";

type NavbarProps = { handleOpenProfile: () => void };
type NavItem = { to: string; label: string; icon: ReactNode; badge?: number };

// Collapses into a menu below lg; search on any page jumps to the catalog results
function Navbar({ handleOpenProfile }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const { searchTerm, setSearchTerm } = useSearchTermContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const base = currentUser?.role === "admin" ? "/admin" : currentUser ? "/user" : "";
  const catalogPath = `${base}/books`;
  const links: NavItem[] =
    currentUser?.role === "admin"
      ? [
          { to: "/admin/dashboard", label: "Dashboard", icon: <IoGridOutline /> },
          { to: "/admin/members", label: "Members", icon: <IoPeopleOutline /> },
          { to: "/admin/booklist", label: "Books", icon: <IoLibraryOutline /> },
          { to: "/admin/transactions", label: "Transactions", icon: <IoReceiptOutline /> },
        ]
      : currentUser
        ? [
            { to: "/user/dashboard", label: "Dashboard", icon: <IoGridOutline /> },
            { to: "/user/my-books", label: "My Books", icon: <IoBookOutline /> },
            { to: "/user/cart", label: "Cart", icon: <IoCartOutline />, badge: currentUser.cart_books?.length ?? 0 }, // same list the Cart page shows
          ]
        : [];

  // admins have 4 links: show icons only between lg and xl so the search keeps its width
  const labelClass = currentUser?.role === "admin" ? "d-lg-none d-xl-inline" : "";
  const close = () => setOpen(false);
  const onSearch = (value: string) => {
    setSearchTerm(value);
    const onCatalog = pathname === "/" || pathname === catalogPath;
    if (value.trim() && !onCatalog) navigate(catalogPath);
  };

  return (
    <nav className="navbar navbar-expand-lg app-navbar">
      <div className="container-fluid px-3 px-lg-4">
        <NavLink to={catalogPath} className="navbar-brand d-flex align-items-center gap-2 me-lg-4" onClick={close}>
          <span className="brand-icon"><FaBook /></span>
          <span className="brand-text">OLMS</span>
        </NavLink>

        <button className="navbar-toggler border-0 shadow-none" type="button" aria-controls="main-nav"
          aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="main-nav">
          <div className="nav-search my-3 my-lg-0 mx-lg-auto" role="search">
            <IoSearch className="nav-search-icon" aria-hidden="true" />
            <input type="search" id="search" value={searchTerm} className="form-control"
              placeholder="Search by title, author, genre..." aria-label="Search books"
              onChange={(e) => onSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") close(); }} />
            {searchTerm && (
              <button type="button" className="nav-search-clear" aria-label="Clear search" onClick={() => setSearchTerm("")}>
                <IoCloseCircle />
              </button>
            )}
          </div>

          {currentUser ? (
            <ul className="navbar-nav align-items-lg-center gap-1 gap-lg-2 ms-lg-4 pb-2 pb-lg-0">
              {links.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink className="nav-link app-nav-link" to={link.to} onClick={close} title={link.label} aria-label={link.label}>
                    <span className="fs-5 d-inline-flex">{link.icon}</span>
                    <span className={labelClass}>{link.label}</span>
                    {link.badge ? <span className="badge rounded-pill bg-warning text-dark nav-badge">{link.badge}</span> : null}
                  </NavLink>
                </li>
              ))}
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0 pt-2 pt-lg-0 border-top border-lg-0 nav-profile-item">
                <button type="button" className="nav-link app-nav-link w-100" title="Profile"
                  onClick={() => { close(); handleOpenProfile(); }}>
                  <span className="nav-avatar">{currentUser.username.charAt(0).toUpperCase()}</span>
                  <span className="d-lg-none text-truncate">{currentUser.username}</span>
                </button>
              </li>
            </ul>
          ) : (
            <div className="d-flex gap-2 ms-lg-4 pb-3 pb-lg-0">
              <NavLink to="login" className="btn btn-outline-dark rounded-pill px-4 flex-fill" onClick={close}>Login</NavLink>
              <NavLink to="register" className="btn btn-dark rounded-pill px-4 flex-fill" onClick={close}>Sign Up</NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
