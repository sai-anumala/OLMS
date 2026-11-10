import { useState } from "react";
import { Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useAuth } from "../../store/AuthContextProvider";
import type { BookType } from "../../types/BookType";
import BookCard from "../../components/common/BookCard";
import BookDetailsModal from "../../components/common/BookDetailsModal";
import { EmptyState } from "../../components/common/ui";

// Cart page; the server sends cart_books with full details and checks limits when borrowing
function Cart() {
  const navigate = useNavigate();
  const { currentUser, cartBooksBorrow, bookBorrow, bookRemoveFromCart } = useAuth();
  const [selected, setSelected] = useState<BookType | null>(null);
  const cartBooks = currentUser?.cart_books ?? [];

  if (cartBooks.length === 0) {
    return (
      <EmptyState title="Empty Cart" message="It looks like there are no books in your cart."
        actionLabel="Explore Books" onAction={() => navigate("/user/books")} />
    );
  }

  return (
    <div className="container py-3">
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between my-3">
        <h3 className="mb-0">Cart Books</h3>
        <button className="btn btn-dark" onClick={() => cartBooksBorrow(cartBooks.map((book) => book._id!))}>Borrow All</button>
      </div>
      <Row xs={1} sm={2} lg={3} className="g-4 align-items-center">
        {cartBooks.map((book) => (
          <BookCard key={book._id} book={book} onViewDetails={setSelected} onBorrow={bookBorrow} onRemove={bookRemoveFromCart} />
        ))}
      </Row>
      <BookDetailsModal book={selected} onClose={() => setSelected(null)}
        onBorrow={(bookId) => { bookBorrow(bookId); setSelected(null); }} />
    </div>
  );
}

export default Cart;
