import { Button, Card, CardBody, CardImg, Col, Modal, ModalBody, Row } from "react-bootstrap"
import { fetchBooks } from "../../store/BooksContext"
import { useState, useMemo } from "react"
import { LuUser } from "react-icons/lu";
import { BiArrowFromLeft } from "react-icons/bi";
import { CiShoppingCart } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useAuth } from "../../store/AuthContextProvider";
import { useSearchTermContext } from "../../store/SearchContext";
import type { BookType } from "../../types/BookType"
import toast from "react-hot-toast";
import CarouselC from "./CarouselC";


function Books() {
    // to show modal
    let [showModal,setShowModal]=useState<boolean>(false)
    const navigate=useNavigate()
    // from the book context ({books}=useContext hook (contextobj))
    const {books}=fetchBooks()
    
    // const {handleAddToCart}=useAddToCart()
    const {currentUser,bookAddToCart,bookBorrow}=useAuth()
    const {searchTerm}=useSearchTermContext()

    // search filter to filter (memoized)
    const search = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
    const filteredBooks = useMemo(() =>
      books.filter((book: BookType) =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.genre.toLowerCase().includes(search)
      ),
      [books, search]
    );

    // to handle cart login based
    function handleCart(bookId:string){
      if(currentUser){
        bookAddToCart(bookId)
      }
      else{
        toast("Please login to to add cart",{
          "icon":"🤧"
        })
        navigate('/login')
      }
    }

    // hanlde borrow
    function handleBorrow(bookId:string):void{
      if(currentUser){
        bookBorrow(bookId)
      }
      else{
        toast("Please login to Borrow Book",{
          "icon":"🤧"})
        navigate('/login')
      }
    }

    // display view button clicked book on modal
    let [modalData,setModalData]=useState<BookType>({
      title:"",
      author:'',
      image:'',
      rating:0,
      availability:0,
      description:'',
      isbn:'',
      pages:0,
      genre:'',
      published:''
    })

  return (
    <div>
      {searchTerm.length===0 && <CarouselC/>}
      <div className="container-fluid">
      {filteredBooks.length>0 ? <div> <h3 className="mt-3 ">Featured Books</h3> </div> : ""}
          {/* <div className="row row-cols-md-2 row-cols-xl-4 row-cols-lg-3 row-cols-sm-1 row-cols-xs-1 align-items-center justify-content-center"> */}
          <Row xs={1} sm={2} lg={3} xl={4} className="g-4 d-flex ms-1 flex-wrap justify-content-center align-items-center">
              {
                filteredBooks.length>0 ? (
                  filteredBooks.filter(obj=>obj.isDelete!==true).map(bookObj=>(
                      // <div className="col">
                      <Col key={bookObj._id || bookObj.isbn}>
                          <Card style={{width:"18rem"}} className="mb-3 mt-3 shadow">
                              <CardImg  src={bookObj.image} style={{height:"15.2rem", overflow:"hidden"}} className="img-fluid"/>
                              <CardBody className="d-flex flex-column">
                                  <div className="d-flex justify-around">
                                    {bookObj.availability!==0 && bookObj.status===true ?  <span className="bg-dark text-white p-2 rounded-4"style={{fontSize:"0.6rem"}}>Available</span> : <span className="bg-dark text-white p-2 rounded-4" style={{fontSize:"0.5rem"}}>Not Available</span>}
                                    <span className="ms-auto"> <FaStar className="text-warning mb-1"/> {bookObj.rating.toFixed(1)}</span>
                                  </div>
                                  <h6 className="text-dark text-start mt-1">{bookObj.title}</h6>
                                  <p className="text-secondary text-start">by {bookObj.author}</p>
                                  <p className="text-start"><span className="border rounded-2 p-1 " style={{fontSize:"0.8rem"}}>{bookObj.genre}</span></p>
                                  <div className="d-flex justify-content-between">
                                    <p className="text-success ">
                                      Available :
                                    </p><span className="text-start text-secondary">{bookObj.availability} out of 20</span>

                                  </div>                                
                                    <div className={`mt-1 d-flex ${currentUser? currentUser.role==="admin" ? 'justify-content-center':"justify-content-between" : "justify-content-between"}`}>
                                      <span>
                                        <button type="button" className="btn btn-dark text-white rounded-2" onClick={()=>{setModalData(bookObj),setShowModal(true)}}>View Details</button>
                                      </span>
                                      <span className="ms-4">
                                        { currentUser?.role!=="admin" && <button
                                          type="button"
                                          className="btn btn-warning"
                                          disabled={bookObj.availability===0 || bookObj.status===false}
                                          onClick={() => { if (bookObj._id) handleCart(bookObj._id); }}
                                          aria-label="Add to cart"
                                        >
                                          <CiShoppingCart className="fs-4" />
                                        </button>}
                                      </span>
                                  </div>
                              </CardBody>
                          </Card>
                      {/* </div> */}
                      </Col>

                      ))):
                      (
                        <div className="d-flex justify-content-center mx-auto align-items-center flex-column text-center "
                            style={{ minHeight: "60vh" }}>
                          <div className="card shadow-sm p-4 border alert alert-success" style={{ maxWidth: "500px" }}>
                            <div className="card-body">
                              <i className="bi bi-gem text-orange fs-1 mb-3"></i>
                              {books.length===0 ? <h5 className="fw-bold mb-2">No Books Avilable on library</h5> : <h5 className="fw-bold mb-2">No Books Found With Search word "{searchTerm}"</h5>}
                              
                            </div>
                          </div>
                        </div>
                        
                  )
                  }
                  {/* </div> */}
          </Row>

              {/* Modal to dispaly full book details */}
              {
                showModal===true && <div>
                  <Modal show={showModal} scrollable centered>
                      <Button className=" m-1 mt-1 me-2 ms-auto btn-dark px-2 py-1"  onClick={()=>setShowModal(false)}>X</Button>
                      <ModalBody style={{maxHeight:"580px",overflowY:"auto",overflowX:"hidden"}}>
                        <Row>
                          <Col>
                              <img src={modalData.image} alt={modalData.title} width={"100%"} height={"250px"} className="rounded-2" />
                          </Col>
                          <Col>
                                <h4>{modalData.title}</h4>
                                <span className="text-secondary"><LuUser /> {modalData.author}</span>
                                <br />
                                <br />
                                <p className="d-flex justify-around">
                                  <span>
                                    <FaStar className="text-warning mb-1 me-1"/>
                                    {modalData.rating.toFixed(1)}
                                  </span>
                                  <span className="border rounded-3 ps-1 pe-1 ms-auto" style={{fontSize:"0.85rem"}}>
                                    {modalData.genre}
                                  </span></p>
                                  
                                <div className="d-flex">
                                      {modalData.availability===0 ? <span className="bg-dark text-white p-2 rounded-4" style={{fontSize:"0.7rem"}}>Not Available</span>:<span className="bg-dark text-white p-2 rounded-4" style={{fontSize:"0.7rem"}}> Available</span>}
                                    <span className="ms-3 text-secondary">{modalData.availability} out of 20</span>
                                </div>
                                  
                                  {/* <br /> */}
                                  <hr />
                                  <h5>Description</h5>
                                  <p>{modalData.description}</p>
                                  <hr />
                                  <Row>
                                    <Col>
                                    <span><b>ISBN:</b></span>
                                    <br />
                                    <p>{modalData.isbn}</p>
                                    
                                    <span><b>Published:</b></span>
                                    <p>{modalData.published} </p>
                                    </Col>
                                    <Col>
                                    {/* pages */}
                                    <span><b>Pages:</b></span>
                                    <p>{modalData.pages}</p>
                                    <br />
                                    {/* Availability */}
                                    <span>
                                      <b>Available:</b>
                                    </span>
                                    <p>{modalData.availability} out of 20</p>
                                    </Col>
                                  </Row>
                                  <hr />
                                  {
                                    modalData.availability===0 &&
                                    <p className="border text-secondary rounded-3 ps-2">This book is currently unavailable....</p>
                                  }

                                  {/* buttons */}
                                  {currentUser===null || currentUser.role==="user" ? <div className="d-flex justify-between mb-2">
                                    {/* Cart Button */}
                                    <span>
                                      <button type="button" className="btn btn-warning" onClick={()=>{if(modalData._id){handleCart(modalData._id)}}} disabled={modalData.availability===0}>
                                      <span>
                                        <CiShoppingCart className="fs-5 me-1 cart-icon-transition"/> 
                                      </span> 
                                      Add Cart</button>
                                    </span>

                                    {/* Borrow Button */}
                                    <span className="ms-auto"> 
                                      <button className="btn btn-dark text-white" disabled={modalData.availability<=0} 
                                      onClick={()=>{if(modalData._id ){handleBorrow(modalData._id)}}}>
                                        Borrow
                                        <BiArrowFromLeft className="fs-5"/>
                                      </button>
                                    </span>
                                  </div> :""}
                          </Col>
                        </Row>
                      </ModalBody>
                  </Modal>
                </div>
              }
      </div>
    </div>
  )
}

export default Books
