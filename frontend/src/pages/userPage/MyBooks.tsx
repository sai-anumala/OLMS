import { NavLink, Outlet } from "react-router";

// Tabs follow the URL, so the active tab is always right (also after a refresh)
const tabClass = ({ isActive }: { isActive: boolean }) => `btn w-100 rounded-5 ${isActive ? "btn-dark" : "btn-outline-dark"}`;

function MyBooks() {
  return (
    <div>
      <div className="container pt-3">
        <div className="row g-2">
          <div className="col-6"><NavLink to="borrow-books" className={tabClass}>Borrowed Books</NavLink></div>
          <div className="col-6"><NavLink to="returned-books" className={tabClass}>Returned Books</NavLink></div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

export default MyBooks;
