import { useAuth } from "../../store/AuthContextProvider";
import { useState } from "react";
import { useNavigate } from "react-router";
import { IoNavigateCircleOutline } from "react-icons/io5";

function BorrowedBooksList() {
  const { currentUser, returnBook, payFine }=useAuth();
  const navigate=useNavigate()
  // book whose Razorpay checkout is open, so its button can't be clicked twice
  const [payingBookId, setPayingBookId]=useState<string | null>(null)

  // paying the fine opens Razorpay checkout; on success the server returns the book
  const handlePayFineClick = async (bookId: string) => {
    setPayingBookId(bookId);
    await payFine(bookId);
    setPayingBookId(null);
  };

  const borrowedDetails = currentUser?.borrowed_books || [];

  // navigate handler
  const handleNavigate=()=>navigate("/user/books")
 
  function handleReturn(bookId: string) {
    if (currentUser && currentUser._id) {
      returnBook(bookId);
    }
  }
 
  return (
    <div className="container m-4 dashboard-container mx-auto aligin-items-center">
      {borrowedDetails.length!==0 && <h4 className="mt-5">Currently Borrowed Books</h4>}
      {borrowedDetails.length!==0 ? borrowedDetails.map((borrowObj) => {
        const bookDetails = borrowObj.book ?? { title: "Book no longer in catalog", author: "", image: "" };
        const due_date = new Date(borrowObj.dueDate).toLocaleDateString();
        return (
          <div
            key={borrowObj.bookId}
            className="card mb-3 shadow-sm border-start border-light border-1 rounded-3"
            style={{ minHeight: "8rem" }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center g-3">
                {/* book Image */}
                <div className="me-3">
                  <img src={bookDetails.image}
                    alt={`No image`}
                    className="rounded"
                    style={{ width: "90px", height: "100px" }}
                  />
                </div>
 
                {/* book Details and borrow Info */}
                <div className="d-flex flex-column flex-md-row justify-content-between flex-grow-1 py-1 align-items-center min-w-0">
                  {/* title and Author */}
                  <div className="text-start mb-2 mb-md-0 me-md-4 mw-100" style={{ flexBasis:"25%",minWidth:"150px" }}>
                    <h5 className="fw-bold mb-0 text-truncate">{bookDetails.title}</h5>
                    <p className="text-muted mb-0 small">{bookDetails.author}</p>
                  </div>
 
                  {/* Due Date */}
                  <div className="text-start text-md-center mb-1 mb-md-0" style={{flexBasis:"25%"}}>
                    <div className="text-secondary small">Due Date</div>
                    <div className="fw-bold text-warning fs-6">{due_date}</div>
                  </div>
 
                  {/* fine */}
                  <div
                    className="text-start text-md-center mb-1 mb-md-0"
                    style={{ flexBasis: "25%" }}
                  >
                    <div className="text-secondary small">Fine</div>
                    <div
                      className={`fw-bold fs-5 ${
                        borrowObj.fine > 0 ? "text-danger small" : "text-success"
                      }`}
                    >
                      {borrowObj.fine > 0 ? `₹${borrowObj.fine}` : "No Fine"}
                    </div>
                  </div>
 
                  {/* actions(return & pay fines) */}
                  <div className="text-start text-md-center" style={{ flexBasis: "25%" }}>
                    <div className="text-secondary small mb-1 d-md-block d-none">Actions</div>
                    <div className="d-flex flex-column flex-sm-row justify-content-center">
                      <button
                        className="btn btn-sm btn-outline-dark me-sm-2 mb-1 mb-sm-0"
                        onClick={() => handleReturn(borrowObj.bookId as string)}
                      >
                        Return
                      </button>
                      {borrowObj.fine > 0 ? (
                        <button
                          className="btn btn-sm btn-dark"
                          disabled={payingBookId !== null}
                          onClick={() => borrowObj.bookId && handlePayFineClick(borrowObj.bookId)}
                        >
                          {payingBookId === borrowObj.bookId ? "Opening..." : "Pay Fine"}
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-dark" disabled>
                          No Fine
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }):
         <div className="d-flex justify-content-center mx-auto align-items-center flex-column text-center"
          style={{ minHeight:"62vh"}}>
          <div className="card shadow-sm p-4 border-1 alert alert-success" style={{ maxWidth:"500px"}}>
            <div className="card-body">
              <h5 className="fw-bold mb-2">Empty Borrow List</h5>
              <p className="text-muted mb-3">
                  It looks like there are no books borrowed..
              </p>

              <button className="btn btn-success btn-sm shadow shadow-sm " onClick={handleNavigate}>Explore Books <IoNavigateCircleOutline className="fs-3" /></button>
        
            </div>
          </div>
        </div> }
 
    </div>
  );
}
 
export default BorrowedBooksList;
 

