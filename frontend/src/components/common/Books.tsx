import { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useBooks } from "../../store/BooksContext";
import { useAuth } from "../../store/AuthContextProvider";
import { useSearchTermContext } from "../../store/SearchContext";
import { getCatalogBooks } from "../../services/book";
import type { BookType } from "../../types/BookType";
import CarouselC from "./CarouselC";
import BookCard from "./BookCard";
import BookDetailsModal from "./BookDetailsModal";
import { EmptyState } from "./ui";

// Catalog page: carousel + book grid; search runs on the server
function Books() {
  const navigate = useNavigate();
  const { books } = useBooks();
  const { currentUser, bookAddToCart, bookBorrow } = useAuth();
  const { searchTerm } = useSearchTermContext();
  const [selected, setSelected] = useState<BookType | null>(null);
  const [searchResults, setSearchResults] = useState<BookType[] | null>(null);

  // ask the server 300ms after typing stops; re-run when the catalog reloads (e.g. after a borrow)
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchResults(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const res = await getCatalogBooks(term);
      if (!cancelled) setSearchResults(res.status === 200 && Array.isArray(res.data.payload) ? (res.data.payload as BookType[]) : []);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, books]);

  const shownBooks = searchResults ?? books;
  const isReader = currentUser?.role !== "admin";

  // logged-out visitors are sent to the login page
  const requireLogin = (action: (bookId: string) => void) => (bookId: string) => {
    if (currentUser) return action(bookId);
    toast("Please login to continue", { icon: "🤧" });
    navigate("/login");
  };
  const addToCart = requireLogin(bookAddToCart);
  const borrow = requireLogin((bookId) => {
    bookBorrow(bookId);
    setSelected(null);
  });

  return (
    <div>
      {!searchTerm && <CarouselC />}
      <div className="container-fluid">
        {shownBooks.length > 0 ? (
          <>
            <h3 className="mt-3">{searchTerm ? `Results for "${searchTerm}"` : "Featured Books"}</h3>
            <Row xs={1} sm={2} lg={3} xl={4} className="g-4 d-flex flex-wrap justify-content-center align-items-center">
              {shownBooks.map((book) => (
                <BookCard key={book._id || book.isbn} book={book} onViewDetails={setSelected}
                  onAddToCart={isReader ? addToCart : undefined} />
              ))}
            </Row>
          </>
        ) : (
          <EmptyState title={searchTerm ? `No books found for "${searchTerm}"` : "No books available in the library yet"} />
        )}
      </div>
      <BookDetailsModal book={selected} onClose={() => setSelected(null)}
        onAddToCart={isReader ? addToCart : undefined} onBorrow={isReader ? borrow : undefined} />
    </div>
  );
}

export default Books;
