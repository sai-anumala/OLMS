import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useAuth } from "../../store/AuthContextProvider";
import type { BorrowedBookType } from "../../types/UserType";
import type { PaymentDetailsType, PaymentMethodType } from "../../types/FineType";
import { EmptyState } from "../../components/common/ui";
import { formatDate } from "../../utils/format";

type PaymentFormData = {
  cardNumber?: string;
  expiry?: string;
  cvv?: string; // checked in the form only, never sent
  walletId?: string;
  upiId?: string;
};

const METHODS: PaymentMethodType[] = ["card", "upi", "wallet"];

function BorrowedBooksList() {
  const navigate = useNavigate();
  const { currentUser, returnBook, payFine } = useAuth();
  const [method, setMethod] = useState<PaymentMethodType>("card");
  const [selected, setSelected] = useState<BorrowedBookType | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormData>();
  const borrowed = currentUser?.borrowed_books ?? [];

  const closeModal = () => {
    setSelected(null);
    reset();
  };

  const confirmPayment = (data: PaymentFormData) => {
    if (!selected?.bookId) return;
    const details: PaymentDetailsType =
      method === "card" ? { card_number: data.cardNumber ?? "", exp_date: data.expiry ?? "" }
      : method === "upi" ? { upiId: data.upiId ?? "" }
      : { walletId: data.walletId ?? "" };
    payFine({ bookId: selected.bookId, amount: selected.fine, paymentMethod: method, paymentDetails: details });
    closeModal();
  };

  if (borrowed.length === 0) {
    return (
      <EmptyState title="Empty Borrow List" message="It looks like there are no books borrowed."
        actionLabel="Explore Books" onAction={() => navigate("/user/books")} />
    );
  }

  return (
    <div className="container py-3">
      <h4 className="my-3">Currently Borrowed Books</h4>
      {borrowed.map((record) => (
        <div key={record.bookId} className="card mb-3 shadow-sm">
          <div className="card-body d-flex flex-column flex-sm-row gap-3 align-items-sm-center text-start">
            <div className="d-flex gap-3 align-items-center flex-grow-1 min-w-0">
              <img src={record.book?.image} alt="" className="rounded list-thumb" />
              <div className="min-w-0">
                <h5 className="fw-bold mb-0 text-break">{record.book?.title ?? "Book no longer in catalog"}</h5>
                <p className="text-muted mb-0 small">{record.book?.author}</p>
              </div>
            </div>
            <div className="d-flex gap-4 flex-shrink-0">
              <div>
                <div className="text-secondary small">Due Date</div>
                <div className={`fw-bold ${record.overdue ? "text-danger" : "text-warning"}`}>{formatDate(record.dueDate)}</div>
              </div>
              <div>
                <div className="text-secondary small">Fine</div>
                <div className={`fw-bold ${record.fine > 0 ? "text-danger" : "text-success"}`}>
                  {record.fine > 0 ? `₹${record.fine}` : "No Fine"}
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 flex-shrink-0">
              <button className="btn btn-sm btn-outline-dark flex-fill" onClick={() => record.bookId && returnBook(record.bookId)}>
                Return
              </button>
              <button className="btn btn-sm btn-dark flex-fill" disabled={record.fine <= 0} onClick={() => setSelected(record)}>
                {record.fine > 0 ? "Pay Fine" : "No Fine"}
              </button>
            </div>
          </div>
        </div>
      ))}

      <Modal show={selected !== null} onHide={closeModal} centered backdrop="static">
        <form onSubmit={handleSubmit(confirmPayment)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">Make Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="card bg-light p-3 mb-4 border-0">
              <h6 className="text-secondary mb-2 text-center">
                Payment for <span className="text-dark fw-semibold">{selected?.book?.title}</span>
              </h6>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Fine Amount:</span>
                <strong className="fs-4 text-danger">₹{selected?.fine.toFixed(2)}</strong>
              </div>
            </div>

            <label className="form-label fw-bold mb-2">Select Payment Method</label>
            <div className="btn-group w-100 mb-3" role="group">
              {METHODS.map((m) => (
                <button key={m} type="button" className={`btn ${method === m ? "btn-dark" : "btn-outline-secondary"} text-capitalize`}
                  onClick={() => setMethod(m)}>
                  {m}
                </button>
              ))}
            </div>

            <div className="p-3 border rounded text-start">
              {method === "card" && (
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small text-muted">Card Number</label>
                    <input className="form-control" inputMode="numeric" placeholder="Enter card number"
                      {...register("cardNumber", { required: "Card number is required", pattern: { value: /^\d{16}$/, message: "Card number must be exactly 16 digits" } })} />
                    {errors.cardNumber && <p className="text-danger small mb-0">{errors.cardNumber.message}</p>}
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Expiry Date</label>
                    <input className="form-control form-control-sm" placeholder="MM/YY"
                      {...register("expiry", { required: "Expiry date is required", pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: "Expiry must be in MM/YY format" } })} />
                    {errors.expiry && <p className="text-danger small mb-0">{errors.expiry.message}</p>}
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">CVV</label>
                    <input className="form-control form-control-sm" inputMode="numeric" placeholder="***" maxLength={4}
                      {...register("cvv", { required: "CVV is required", pattern: { value: /^\d{3,4}$/, message: "CVV must be 3 or 4 digits" } })} />
                    {errors.cvv && <p className="text-danger small mb-0">{errors.cvv.message}</p>}
                  </div>
                </div>
              )}
              {method === "upi" && (
                <>
                  <label className="form-label small text-muted">UPI ID</label>
                  <input className="form-control form-control-sm" placeholder="example@upi"
                    {...register("upiId", { required: "UPI ID is required", pattern: { value: /^[\w.-]+@[\w.-]+$/, message: "Enter a valid UPI ID (e.g., name@bank)" } })} />
                  {errors.upiId && <p className="text-danger small mb-0">{errors.upiId.message}</p>}
                </>
              )}
              {method === "wallet" && (
                <>
                  <label className="form-label small text-muted">Wallet ID / Phone Number</label>
                  <input className="form-control form-control-sm" inputMode="numeric" placeholder="Enter Wallet ID or Phone"
                    {...register("walletId", { required: "Wallet ID is required", pattern: { value: /^\d{10}$/, message: "Wallet ID must be a 10-digit phone number" } })} />
                  {errors.walletId && <p className="text-danger small mb-0">{errors.walletId.message}</p>}
                </>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-dark w-100 py-2">Confirm Payment</button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

export default BorrowedBooksList;
