import { Button, Col, Modal, ModalBody, Row } from "react-bootstrap";
import { fetchBooks } from "../../store/BooksContext";
import { useState } from "react";
import type { BookType } from "../../types/BookType";
import { LuUser } from "react-icons/lu";
import { BiArrowFromLeft } from "react-icons/bi";
import { CiShoppingCart } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { BookCard } from "../user/CartBookCard"; 
import { useAuth } from "../../store/AuthContextProvider";


function BookViewModal() {
    const [showModal,setShowModal]=useState<boolean>(false);
    const [modalData,setModalData]=useState<BookType | null>(null);

    const {books}=fetchBooks()
    const {currentUser,bookAddToCart,bookBorrow}=useAuth()

    const handleViewDetails=(book:BookType)=>{
        setModalData(book);
        setShowModal(true);
    };

    return (
        <div className="container-fluid">
            <Row xs={1} sm={2} lg={3} xl={4} className="g-3 align-items-center">
                {books.map(bookObj=>(
                    <BookCard key={bookObj._id || bookObj.isbn} bookObj={bookObj} onViewDetails={handleViewDetails} userCart={false}/>
                ))}
                
            </Row>

            {/* Modal to display full book details */}
            {modalData && (
                <Modal show={showModal} scrollable centered onHide={()=>setShowModal(false)}>
                    <Button className="m-1 mt-1 me-2 ms-auto btn-dark px-2 py-1" onClick={()=>setShowModal(false)}>
                        X
                    </Button>
                    <ModalBody
                        style={{
                            maxHeight: "580px",
                            overflowY: "auto",
                            overflowX: "hidden",
                        }}>
                        {/* The modal content remains the same */}
                        <Row>
                            <Col xs={12} md={6}>
                                <img
                                    src={modalData.image}
                                    alt={modalData.title}
                                    style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                                    className="rounded-2"
                                />
                            </Col>
                            <Col xs={12} md={6}>
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
                                    <span className="border rounded-3 ps-1 pe-1 ms-auto" style={{fontSize:"0.83rem"}}>
                                        {modalData.genre}
                                    </span>
                                </p>
                                <div className="d-flex">
                                    {modalData.availability===0 || modalData.status===false ?
                                        <span className="bg-dark text-white p-2 rounded-4" style={{fontSize:"0.7rem"}}>
                                            Not Available
                                        </span>
                                    :(
                                        <span className="bg-dark text-white p-2 rounded-4" style={{fontSize:"0.7rem"}}>
                                            Available
                                        </span>
                                    )}
                                    <span className="ms-3 text-secondary">{modalData.availability} out of 20</span>
                                </div>
                                <hr />
                                <h5>Description</h5>
                                <p>{modalData.description}</p>
                                <hr />
                                <Row>
                                    <Col>
                                        <span>
                                            <b>ISBN:</b>
                                        </span>
                                        <br />
                                        <p>{modalData.isbn}</p>
                                        <span>
                                            <b>Published on:</b>
                                        </span>
                                        <p>{modalData.published}</p>
                                    </Col>
                                    <Col>
                                        <span>
                                            <b>Pages:</b>
                                        </span>
                                        <p>{modalData.pages}</p>
                                        <br />
                                        <span>
                                            <b>Available:</b>
                                        </span>
                                        <p>{modalData.availability} out of 20</p>
                                    </Col>
                                </Row>
                                <hr />
                                {modalData.availability===0 || modalData.status===false ? (
                                    <p className="border text-secondary rounded-3 ps-2">This book is currently unavailable....</p>
                                ):
                                (<div className="d-flex flex-column flex-md-row gap-2 mb-2">
                                    <span>
                                        <button className="btn btn-warning w-100" disabled={modalData.availability===0} onClick={()=>{if(modalData._id){bookAddToCart(modalData._id)}}}>
                                            <span>
                                                <CiShoppingCart className="fs-5 me-1 cart-icon-transition" />
                                            </span>
                                            Add Cart
                                        </button>
                                    </span>
                                    <span className="w-100">
                                        <button className="btn btn-dark text-white w-100" disabled={modalData.availability===0}  onClick={()=>{if(modalData._id && currentUser?._id){bookBorrow(modalData._id)}}}>
                                            Borrow
                                            <BiArrowFromLeft className="fs-5" />
                                        </button>
                                    </span>
                                </div>)}
                            </Col>
                        </Row>
                    </ModalBody>
                </Modal>
            )}
        </div>
    );
}

export default BookViewModal;