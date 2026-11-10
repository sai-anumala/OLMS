import { Button, Card, CardBody, CardImg, Col } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { CiShoppingCart } from "react-icons/ci";
import { BiArrowFromLeft } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import type { BookType } from "../../types/BookType";
import { copiesLabel } from "../../utils/format";

type BookCardProps = {
  book: BookType;
  onViewDetails: (book: BookType) => void;
  onAddToCart?: (bookId: string) => void; // catalog card
  onBorrow?: (bookId: string) => void;    // cart card
  onRemove?: (bookId: string) => void;    // cart card
};

// Book card for the catalog and the cart (original design); buttons depend on the handlers passed
export function BookCard({ book, onViewDetails, onAddToCart, onBorrow, onRemove }: BookCardProps) {
  const id = book._id ?? "";
  const isCart = Boolean(onRemove);

  return (
    <Col>
      <Card style={{ width: "18rem", maxWidth: "100%" }} className={`mb-3 shadow mx-auto ${isCart ? "" : "mt-3"}`}>
        <CardImg src={book.image} style={{ height: "15.2rem", overflow: "hidden", position: "relative" }} className="img-fluid" />
        {onRemove && (
          <Button className="btn btn-secondary" size="sm" style={{ position: "absolute", top: "10px", right: "10px" }}
            onClick={() => onRemove(id)} aria-label="Remove book">
            <AiOutlineClose />
          </Button>
        )}
        <CardBody className="d-flex flex-column">
          <div className="d-flex justify-around">
            {book.isAvailable
              ? <span className="bg-dark text-white p-2 rounded-4" style={{ fontSize: "0.6rem" }}>Available</span>
              : <span className="bg-dark text-white p-2 rounded-4" style={{ fontSize: "0.5rem" }}>Not Available</span>}
            <span className="ms-auto"> <FaStar className="text-warning mb-1" /> {book.rating.toFixed(1)}</span>
          </div>
          <h6 className="text-dark text-start mt-1">{book.title}</h6>
          <p className="text-secondary text-start">by {book.author}</p>
          <p className="text-start"><span className="border rounded-2 p-1 " style={{ fontSize: "0.8rem" }}>{book.genre}</span></p>
          {isCart ? (
            <span className="text-start text-secondary">{copiesLabel(book.availability, book.copies)}</span>
          ) : (
            <div className="d-flex justify-content-between">
              <p className="text-success ">Available :</p>
              <span className="text-start text-secondary">{copiesLabel(book.availability, book.copies)}</span>
            </div>
          )}
          <div className={`mt-1 d-flex ${onAddToCart || onBorrow ? "justify-content-between" : "justify-content-center"}`}>
            <span>
              <button type="button" className="btn btn-dark text-white rounded-2" onClick={() => onViewDetails(book)}>View Details</button>
            </span>
            {onAddToCart && (
              <span className="ms-4">
                <button type="button" className="btn btn-warning" disabled={!book.isAvailable}
                  onClick={() => onAddToCart(id)} aria-label="Add to cart">
                  <CiShoppingCart className="fs-4" />
                </button>
              </span>
            )}
            {onBorrow && (
              <span className="ms-auto">
                <button className="btn  borrow" disabled={!book.isAvailable} onClick={() => onBorrow(id)}>
                  Borrow
                  <BiArrowFromLeft className="fs-5" />
                </button>
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
}

export default BookCard;
