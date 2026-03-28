
import type { BookType } from "../../types/BookType";
import { Button, Col, Modal, ModalBody, Row } from "react-bootstrap";
import { fetchBooks } from "../../store/BooksContext";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { BookCard } from "../../components/user/CartBookCard";
import { LuUser } from "react-icons/lu";
import { BiArrowFromLeft } from "react-icons/bi";
import { useAuth } from "../../store/AuthContextProvider";
import { IoNavigateCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router";

 
function Cart() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<BookType | null>(null);
  const [cartBooks, setCartBooks] = useState<BookType[]>([]);
 
  const { currentUser, cartBooksBorrow } = useAuth();
  const { books } = fetchBooks();
  const navigate = useNavigate();
 
  const handleViewDetails = (book: BookType) => {
    setModalData(book);
    setShowModal(true);
  };
 
  const handleCartBorrow = () => {
    if (!currentUser?.cart || currentUser.cart.length === 0) return;
    cartBooksBorrow(currentUser.cart);
  };
 
  const handleModalBorrow = () => {
    if (!modalData || modalData.availability === 0) return;
    // cartBooksBorrow([modalData._id]);
    cartBooksBorrow([modalData._id!]);
 
    setShowModal(false);
  };
 
  const handleNavigate = () => navigate("/user/books");
 
  useEffect(() => {
    if (currentUser?.cart) {
      const bookCart: BookType[] = currentUser.cart
        .map(bookId => books.find(bookObj => bookId === bookObj._id))
        .filter((book): book is BookType => book !== undefined);
      setCartBooks(bookCart);
    }
  }, [books, currentUser]);
 
  return (
    <div className="container">
      {cartBooks.length > 0 ? (
        <div>
          <h3 className="mt-3 mb-4 text-center p-relative"> Cart Books</h3>
          <div className="mt-4 d-flex justify-content-end align-items-center">
            <button className="btn btn-dark borrowAll" onClick={handleCartBorrow}>Borrow All</button>
          </div>
        </div>
      ) : null}
 
      <Row xs={1} sm={2} lg={3} xl={4} className="d-flex flex-row gap-4 align-items-center">
        {cartBooks.length > 0 ? (
          cartBooks.map(bookObj => (
            <BookCard
              key={bookObj._id || bookObj.isbn}
              bookObj={bookObj}
              userCart={true}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <div
            className="d-flex justify-content-center mx-auto align-items-center flex-column text-center"
            style={{ minHeight: "72vh" }}
          >
            <div className="card shadow-sm p-4 border-1" style={{ maxWidth: "500px" }}>
              <div className="card-body">
                <h5 className="fw-bold mb-2">Empty Cart</h5>
                <p className="text-muted mb-3">It looks like there are no books in your cart.</p>
                <button className="btn btn-success btn-sm shadow" onClick={handleNavigate}>
                  Explore Books <IoNavigateCircleOutline className="fs-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Row>
 
      {modalData && (
        <Modal show={showModal} scrollable centered onHide={() => setShowModal(false)}>
          <Button className="m-1 mt-1 me-2 ms-auto btn-dark px-2 py-1" onClick={() => setShowModal(false)}>
            X
          </Button>
          <ModalBody style={{ maxHeight: "580px", overflowY: "auto", overflowX: "hidden" }}>
            <Row>
              <Col>
                <img
                  src={modalData.image}
                  alt={modalData.title}
                  width={"100%"}
                  height={"250px"}
                  className="rounded-2"
                />
              </Col>
              <Col>
                <h4>{modalData.title}</h4>
                <span className="text-secondary">
                  <LuUser /> {modalData.author}
                </span>
                <br />
                <br />
                <p className="d-flex justify-around">
                  <span>
                    <FaStar className="text-warning mb-1 me-1" />
                    {modalData.rating.toFixed(1)}
                  </span>
                  <span className="border rounded-3 ps-1 pe-1 ms-auto" style={{ fontSize: "0.83rem" }}>
                    {modalData.genre}
                  </span>
                </p>
                <div className="d-flex">
                  <span className="bg-dark text-white p-2 rounded-4" style={{ fontSize: "0.7rem" }}>
                    {modalData.availability === 0 ? "Not Available" : "Available"}
                  </span>
                  <span className="ms-3 text-secondary">{modalData.availability} out of 20</span>
                </div>
                <hr />
                <h5>Description</h5>
                <p>{modalData.description}</p>
                <hr />
                <Row>
                  <Col>
                    <b>ISBN:</b>
                    <p>{modalData.isbn}</p>
                    <b>Published on:</b>
                    <p>{modalData.published}</p>
                  </Col>
                  <Col>
                    <b>Pages:</b>
                    <p>{modalData.pages}</p>
                    <b>Available:</b>
                    <p>{modalData.availability} out of 20</p>
                  </Col>
                </Row>
                <hr />
                {modalData.availability === 0 && (
                  <p className="border text-secondary rounded-3 ps-2">
                    This book is currently unavailable...
                  </p>
                )}
                <div className="d-flex justify-between mb-2">
                  <span className="mx-auto">
                    <button
                      className="btn btn-warning text-dark borrow"
                      disabled={modalData.availability === 0}
                      onClick={handleModalBorrow}
                    >
                      Borrow <BiArrowFromLeft className="fs-5 borrow-icon" />
                    </button>
                  </span>
                </div>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}
 
export default Cart;
 
 