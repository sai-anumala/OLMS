import type { BorrowedBookType } from "../../types/UserType";
import { fetchBooks } from "../../store/BooksContext";
import { useAuth } from "../../store/AuthContextProvider";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "react-bootstrap";
import type { PaymentDetailsType, PaymentFormType } from "../../types/FineType";
import { useNavigate } from "react-router";
import { IoNavigateCircleOutline } from "react-icons/io5";
 
type PaymentFormData = {
  paymentMethod: "card" | "wallet" | "upi";
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  walletId?: string;
  upiId?: string;
};
 
function BorrowedBooksList() {
  const { currentUser, returnBook, payFine }=useAuth();
  const { books } = fetchBooks();
 
  const [selectedMethod, setSelectedMethod]=useState<"card"|"wallet"|"upi">("card");
  const {register,handleSubmit,formState: { errors }} = useForm<PaymentFormData>();
  const navigate=useNavigate()
 
  //to open Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState<BorrowedBookType>({
    bookId: "",
    borrowDate: "",
    fine: 0,
    dueDate: "",
  });
 
  // to find slected fine book
  const book=books.find((bookObj)=>bookObj._id===selectedFine.bookId)
 
 
  //to confirm payment
  const confirmPayment=(data: PaymentFormData) => {
    setShowModal(false);
    let paymentInfo:PaymentDetailsType;

    if (data.paymentMethod==="card") {
      paymentInfo={
        card_number:data.cardNumber,
        exp_date:data.expiry,
        cvv:data.cvv
      };
    } else if(data.paymentMethod==="upi") {
      paymentInfo={
        upiId:data.upiId
      };
    } else if (data.paymentMethod==="wallet") {
      paymentInfo={
        walletId:data.walletId
      };
    } else {
      throw new Error("Invalid payment method");
    }

    const paymentDetails:PaymentFormType = {
      userId:currentUser?._id,
      bookId: selectedFine.bookId!,
      amount: selectedFine.fine,
      paymentMethod: data.paymentMethod,
      paymentDetails: paymentInfo
    };
    // callinf pay fine api from context
    payFine(paymentDetails)

    // return book in place of fine module
    // returnBook(selectedFine.bookId as string);
    // payFine(selectedFine.bookId as string);
    
  };
 
 
  const borrowedDetails = currentUser?.borrowed_books || [];
 
  //to open Modal
  const handlePayFineClick = (borrowObj: BorrowedBookType) => {
    setSelectedFine(borrowObj);
    setShowModal(true);
  };

  // navigate handler
  const handleNavigate=()=>navigate("/user/books")
 
  function handleReturn(bookId: string) {
    if (currentUser && currentUser._id) {
      returnBook(bookId);
    }
  }
 
  function handleclose() {
    setShowModal(false);
  }
 
  return (
    <div className="container m-4 w-75 mx-auto aligin-items-center">
      {borrowedDetails.length!==0 && <h4 className="mt-5">Currently Borrowed Books</h4>}
      {borrowedDetails.length!==0 ? borrowedDetails.map((borrowObj) => {
        const bookDetails = books.find((bookObj) => borrowObj.bookId === bookObj._id);
        if (!bookDetails) return null;
        let due_date = new Date(borrowObj.dueDate).toLocaleDateString();
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
                <div className="d-flex flex-column flex-md-row justify-content-between flex-grow-1 py-1 align-items-center">
                  {/* title and Author */}
                  <div className="text-start mb-2 mb-md-0 me-md-4" style={{ flexBasis:"25%",minWidth:"150px" }}>
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
                          onClick={() => handlePayFineClick(borrowObj)}
                        >
                          Pay Fine
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
 
      {/* Payment Modal */}
      <Modal show={showModal} centered backdrop="static">
        <form onSubmit={handleSubmit(confirmPayment)}>
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-0 pb-0 d-flex justify-content-center position-relative">
              <h5 className="modal-title fw-bold text-dark">Make Payment</h5>
              <button type="button" className="btn-close position-absolute end-0 top-0 mt-2 me-2" onClick={handleclose}></button>
            </div>
 
            <div className="modal-body pt-2 px-4">
              {/* Summary */}
              <div className="card bg-light p-3 mb-4 border-0">
                <h6 className="text-secondary mb-2 text-center">
                  Payment for <span className="text-dark fw-semibold">{book?.title}</span>
                </h6>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-normal fs-6 text-muted">Fine Amount:</span>
                  <strong className="fs-4 text-danger">₹{selectedFine.fine.toFixed(2)}</strong>
                </div>
              </div>
 
              {/* Payment Method */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-3 ms-2">Select Payment Method</label>
                <div className="d-flex gap-5 justify-content-center flex-wrap">
                  {["card", "upi", "wallet"].map((method) => (
                    <div key={method}>
                      <input
                        type="radio"
                        className="btn-check"
                        id={`radio-${method}`}
                        value={method}
                        {...register("paymentMethod")}
                        onClick={() => setSelectedMethod(method as "card" | "upi" | "wallet")}
                      />
                      <label
                        className={`btn ${
                          selectedMethod === method ? "btn-dark" : "btn-outline-secondary"
                        }`}
                        htmlFor={`radio-${method}`}
                        style={{ minWidth: "80px", textAlign: "center", padding:"3px",}}
                      >
                        {method === "card" && <i className="bi bi-credit-card-2-back me-2"></i>}
                        {method === "upi" && <i className="bi bi-cash me-2"></i>}
                        {method === "wallet" && <i className="bi bi-wallet2 me-2"></i>}
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Conditional Fields */}
              <div className="p-3 border rounded">
                {selectedMethod === "card" && (
                  <div className="row g-3">
 
                    <div className="col-12">
                      <label className="form-label small text-muted">Card Number</label>
                      <input
                        type="text"
                         {...register("cardNumber", {
                          required: "Card number is required",
                          pattern: {
                            value: /^\d{16}$/,
                            message: "Card number must be exactly 16 digits"
                          }
                        })}
                        className="form-control form-control"
                        placeholder="Enter card number"
                      />
                      {errors.cardNumber && (
                    <p className="text-danger small">{errors.cardNumber.message}</p>
                    )}
                    </div>
                   
                    <div className="col-6">
                      <label className="form-label small text-muted">Expiry Date</label>
                      <input
                        type="text"
                          {...register("expiry", {
                        required: "Expiry date is required",
                        pattern: {
                          value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                          message: "Expiry must be in MM/YY format"
                        }
                      })}
                        className="form-control form-control-sm"
                        placeholder="MM/YY"
                      />
                      {errors.expiry && (
                        <p className="text-danger small">{errors.expiry.message}</p>
                      )}
                    </div>
 
                    <div className="col-6">
                      <label className="form-label small text-muted">CVV</label>
                      <input
                        type="text"
                          {...register("cvv", {
                          required: "CVV is required",
                          pattern: {
                            value: /^\d{3,4}$/,
                            message: "CVV must be 3 or 4 digits"
                          }
                        })}
                        className="form-control form-control-sm"
                        placeholder="***"
                        maxLength={4}
                      />
                      {errors.cvv && (
                        <p className="text-danger small">{errors.cvv.message}</p>
                      )}
                    </div>
 
                  </div>
                )}
 
                  {selectedMethod === "upi" && (
                <div className="mb-3">
                  <label className="form-label small text-muted">UPI ID</label>
                  <input
                    type="text"
                      {...register("upiId", {
                      required: "UPI ID is required",
                      pattern: {
                        value: /^[\w.-]+@[\w.-]+$/,
                        message: "Enter a valid UPI ID (e.g., name@bank)"
                      }
                    })}
                    className="form-control form-control-sm"
                    placeholder="example@upi"
                  />
                  {errors.upiId && (
                    <p className="text-danger small">{errors.upiId.message}</p>
                  )}
                </div>
              )}
 
              {selectedMethod === "wallet" && (
                <div className="mb-3">
                  <label className="form-label small text-muted">Wallet ID / Phone Number</label>
                  <input
                    type="text"
                        {...register("walletId", {
                        required: "Wallet ID is required",
                        pattern: {
                          value: /^\d{10}$/,
                          message: "Wallet ID must be a 10-digit phone number"
                        }
                      })}
                    className="form-control form-control-sm"
                    placeholder="Enter Wallet ID or Phone"
                  />
                   {errors.walletId && (
                    <p className="text-danger small">{errors.walletId.message}</p>
                  )}
                </div>
              )}
 
              </div>
            </div>
 
            <div className="modal-footer border-0 p-4 pt-0">
              <button type="submit" className="btn btn-dark w-100 py-2">
                Confirm Payment
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
 
export default BorrowedBooksList;
 

