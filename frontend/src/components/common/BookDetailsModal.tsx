import { Button, Col, Modal, ModalBody, Row } from "react-bootstrap";
import { LuUser } from "react-icons/lu";
import { BiArrowFromLeft } from "react-icons/bi";
import { CiShoppingCart } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import type { BookType } from "../../types/BookType";
import { copiesLabel } from "../../utils/format";

type BookDetailsModalProps = {
  book: BookType | null;
  onClose: () => void;
  onAddToCart?: (bookId: string) => void; // catalog: "Add Cart" + "Borrow"
  onBorrow?: (bookId: string) => void;    // cart (without onAddToCart): centered "Borrow"
};

// Full book details modal (original design), shared by the catalog and the cart
export function BookDetailsModal({ book, onClose, onAddToCart, onBorrow }: BookDetailsModalProps) {
  if (!book) return null;
  const isCart = !onAddToCart;
  const copies = copiesLabel(book.availability, book.copies);

  return (
    <Modal show scrollable centered onHide={onClose}>
      <Button className="m-1 mt-1 me-2 ms-auto btn-dark px-2 py-1" onClick={onClose}>X</Button>
      <ModalBody style={{ maxHeight: "580px", overflowY: "auto", overflowX: "hidden" }}>
        <Row>
          {/* stacked on phones, side by side from sm up */}
          <Col xs={12} sm={6} className="mb-3 mb-sm-0">
            <img src={book.image} alt={book.title} width={"100%"} height={"250px"} className="rounded-2" style={{ objectFit: "cover" }} />
          </Col>
          <Col xs={12} sm={6}>
            <h4>{book.title}</h4>
            <span className="text-secondary"><LuUser /> {book.author}</span>
            <br />
            <br />
            <p className="d-flex justify-around">
              <span>
                <FaStar className="text-warning mb-1 me-1" />
                {book.rating.toFixed(1)}
              </span>
              <span className="border rounded-3 ps-1 pe-1 ms-auto" style={{ fontSize: "0.85rem" }}>
                {book.genre}
              </span>
            </p>
            <div className="d-flex">
              <span className="bg-dark text-white p-2 rounded-4" style={{ fontSize: "0.7rem" }}>
                {book.isAvailable ? "Available" : "Not Available"}
              </span>
              <span className="ms-3 text-secondary">{copies}</span>
            </div>
            <hr />
            <h5>Description</h5>
            <p>{book.description}</p>
            <hr />
            <Row>
              <Col>
                <b>ISBN:</b>
                <p>{book.isbn}</p>
                <b>{isCart ? "Published on:" : "Published:"}</b>
                <p>{book.published}</p>
              </Col>
              <Col>
                <b>Pages:</b>
                <p>{book.pages}</p>
                {!isCart && <br />}
                <b>Available:</b>
                <p>{copies}</p>
              </Col>
            </Row>
            <hr />
            {!book.isAvailable && (
              <p className="border text-secondary rounded-3 ps-2">This book is currently unavailable....</p>
            )}

            {isCart ? (
              onBorrow && (
                <div className="d-flex justify-between mb-2">
                  <span className="mx-auto">
                    <button className="btn btn-warning text-dark borrow" disabled={!book.isAvailable}
                      onClick={() => book._id && onBorrow(book._id)}>
                      Borrow <BiArrowFromLeft className="fs-5 borrow-icon" />
                    </button>
                  </span>
                </div>
              )
            ) : (
              <div className="d-flex justify-between mb-2">
                <span>
                  <button type="button" className="btn btn-warning" disabled={!book.isAvailable}
                    onClick={() => book._id && onAddToCart(book._id)}>
                    <span><CiShoppingCart className="fs-5 me-1 cart-icon-transition" /></span>
                    Add Cart
                  </button>
                </span>
                {onBorrow && (
                  <span className="ms-auto">
                    <button className="btn btn-dark text-white" disabled={!book.isAvailable}
                      onClick={() => book._id && onBorrow(book._id)}>
                      Borrow
                      <BiArrowFromLeft className="fs-5" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

export default BookDetailsModal;
