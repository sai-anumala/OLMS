import {  Button, Card, CardBody, CardImg, Col } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { CiShoppingCart } from "react-icons/ci";
import { BiArrowFromLeft } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../../store/AuthContextProvider";
import type { BookType } from "../../types/BookType";

type BookCardProps = {
    bookObj: BookType;
    onViewDetails: (book: BookType) => void;
    userCart:Boolean;
};

export const BookCard=({bookObj,onViewDetails,userCart}:BookCardProps) => {

    // const {handleAddToCart,removeFromCart}=useAddToCart()
    const {currentUser,bookRemoveFromCart,bookBorrow}=useAuth()
    
    function handleCartBookCancel(bookId:string){
        bookRemoveFromCart(bookId)
    } 
    return (
        <Col key={bookObj._id || bookObj.isbn}>
            <Card style={{ width: "18rem" }} className="mb-3 shadow">
                <CardImg src={bookObj.image} style={{ height:"15.2rem", overflow:"hidden",position:"relative" }}  className="img-fluid" />
                 <Button className="btn btn-secondary" size="sm" style={{position:"absolute",top:"10px",right:"10px"}} onClick={()=>{if(bookObj._id){handleCartBookCancel(bookObj._id)}}} aria-label="Remove book">
                    <AiOutlineClose />
                </Button>
                <CardBody className="d-flex flex-column">
                    <div className="d-flex justify-around">
                        {bookObj.availability!==0 ? (
                            <span className="bg-dark text-white p-2 rounded-4" style={{ fontSize: "0.6rem" }}>
                                Available
                            </span>
                        ):(
                            <span className="bg-dark text-white p-2 rounded-4" style={{ fontSize: "0.5rem" }}>
                                Not Available
                            </span>
                        )}
                        <span className="ms-auto">
                            <FaStar className="text-warning mb-1" /> {bookObj.rating.toFixed(1)}
                        </span>
                    </div>

                    <h6 className="text-dark text-start mt-1">{bookObj.title}</h6>
                    <p className="text-secondary text-start">by {bookObj.author}</p>
                    <p className="text-start">
                        <span className="border rounded-2 p-1 " style={{ fontSize: "0.8rem" }}>
                            {bookObj.genre}
                        </span>
                    </p>
                    <span className="text-start text-secondary">{bookObj.availability} out of 20</span>

                    <div className="mt-1" style={{ display:"flex", justifyContent:"space-between" }}>
                        <span>
                            <button type="button" className="btn btn-dark text-white rounded-2"
                                onClick={()=>onViewDetails(bookObj)}> View Details
                            </button>
                        </span>
                        {
                            userCart?(<span className="ms-auto"> 
                                            <button className="btn  borrow" disabled={bookObj.availability===0} onClick={()=>{if(bookObj._id && currentUser?._id){bookBorrow(bookObj._id)}}}>
                                                Borrow
                                               <BiArrowFromLeft className="fs-5"/>
                                            </button>
                                      </span>):(<span className="ms-4">
                            <button type="button" className="btn btn-warning" disabled={bookObj.availability===0} onClick={()=>{if(bookObj._id){handleCartBookCancel(bookObj._id)}}}>
                                <CiShoppingCart className="fs-4" /> 
                            </button>
                        </span>)
                        }
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

