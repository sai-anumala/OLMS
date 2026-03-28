import { IoNavigateCircleOutline } from "react-icons/io5";
import { useAuth } from "../../store/AuthContextProvider";
import { fetchBooks } from "../../store/BooksContext";
import { useNavigate } from "react-router";
function ReturnedBooks() {
 const { currentUser } = useAuth();
 const { books } = fetchBooks();
 const navigate = useNavigate();
 return (
    <div className="container w-100 w-md-75 mx-auto align-items-center my-4">
        {currentUser?.return_books && currentUser.return_books.length > 0 ? (
    <>
    <h4 className="fw-bold mb-4 text-center">Returned Books</h4>
            {currentUser.return_books.map((returnObj)=>{const bookDetails=books.find((bookObj)=>returnObj.bookId===bookObj._id);
              if (!bookDetails) return null;
              const return_date=new Date(returnObj.returnDate).toLocaleDateString();
              return (
                  <div key={returnObj.transactionId} className="card mb-3 shadow-sm border-start border-1 border-light rounded-3 overflow-hidden">
                    <div className="card-body p-3">
                      <div className="row align-items-center g-3">
                      {/* Book Image */}
                      <div className="col-12 col-sm-3 col-md-2 text-center">
                          <img src={bookDetails.image} alt="Book" className="rounded img-fluid"  style={{ width:'100px',height:'100px',objectFit:'cover',marginRight:'40px'}}/>
                      </div>
                      {/* Book Details */}
                      <div className="col-12 col-sm-9 col-md-10">
                        <div className="row align-items-center text-center text-md-start gy-3">
                          {/* Title & Author */}
                          <div className="col-12 col-md-3 text-truncate">
                            <h5 className="fw-bold mb-0 text-truncate">{bookDetails.title}</h5>
                            <p className="text-muted mb-0 small text-truncate">{bookDetails.author}</p>
                          </div>
                            {/* Returned Date */}
                            <div className="col-6 col-md-2">
                              <div className="text-secondary small">Returned Date</div>
                              <div className="fw-bold text-success fs-6">{return_date}</div>
                            </div>
                            {/* Fine */}
                            <div className="col-6 col-md-2">
                              <div className="text-secondary small">Fine</div>
                              <div className={`fw-bold fs-6 ${returnObj.fine>0 ? "text-primary" : "text-success"}`}>{returnObj.fine>0 ? `₹${returnObj.fine}`: "No Fine"}</div>
                            </div>
                            {/* Transaction ID */}
                            <div className="col-12 col-md-3 text-truncate">
                              <div className="text-secondary small">Transaction Id</div>
                              <div className="fw-bold text-warning small text-truncate" style={{fontSize:"14px"}}>{returnObj.transactionId ? returnObj.transactionId : "-"}
                              </div>
                            </div>
                            {/* Payment Method */}
                            <div className="col-12 col-md-2">
                              <div className="text-secondary small">Payment Method</div>
                              <div className="fw-bold text-danger text-capitalize fs-6">{returnObj.method}</div>
                            </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
              );
            })}
          </>) : (
          // ewmpty State
          <div className="d-flex justify-content-center align-items-center flex-column text-center"style={{minHeight:"72vh"}}>
            <div className="card shadow-sm p-4 border-1" style={{ maxWidth: "500px" }}>
              <div className="card-body">
                <h5 className="fw-bold mb-2">Empty Returned Books</h5>
                <p className="text-muted mb-3">It looks like there are no books borrowed and returned.</p>
                <button className="btn btn-success btn-sm shadow-sm" onClick={()=>navigate("/user/books")}>Explore Books <IoNavigateCircleOutline className="fs-3" /></button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
export default ReturnedBooks;