import { useNavigate } from "react-router";
import { useAuth } from "../../store/AuthContextProvider";
import { EmptyState } from "../common/ui";
import { formatDate } from "../../utils/format";

function ReturnedBooks() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const returned = currentUser?.return_books ?? [];

  if (returned.length === 0) {
    return (
      <EmptyState title="Empty Returned Books" message="It looks like there are no books borrowed and returned."
        actionLabel="Explore Books" onAction={() => navigate("/user/books")} />
    );
  }

  return (
    <div className="container py-3">
      <h4 className="fw-bold my-3">Returned Books</h4>
      {returned.map((record) => (
        <div key={`${record.bookId}-${record.returnDate}`} className="card mb-3 shadow-sm">
          <div className="card-body d-flex flex-column flex-md-row gap-3 align-items-md-center text-start">
            <div className="d-flex gap-3 align-items-center flex-grow-1 min-w-0">
              <img src={record.book?.image} alt="" className="rounded list-thumb" />
              <div className="min-w-0">
                <h5 className="fw-bold mb-0 text-break">{record.book?.title ?? "Book no longer in catalog"}</h5>
                <p className="text-muted mb-0 small">{record.book?.author}</p>
              </div>
            </div>
            <div className="row row-cols-2 row-cols-sm-4 g-2 flex-shrink-0 returned-meta">
              <div>
                <div className="text-secondary small">Returned</div>
                <div className="fw-bold text-success">{formatDate(record.returnDate)}</div>
              </div>
              <div>
                <div className="text-secondary small">Fine</div>
                <div className={`fw-bold ${record.fine > 0 ? "text-primary" : "text-success"}`}>{record.fine > 0 ? `₹${record.fine}` : "No Fine"}</div>
              </div>
              <div>
                <div className="text-secondary small">Payment</div>
                <div className="fw-bold text-capitalize">{record.method && record.method !== "-" ? record.method : "—"}</div>
              </div>
              <div className="min-w-0">
                <div className="text-secondary small">Transaction</div>
                <div className="small text-break" title={record.paymentId ?? record.transactionId}>{record.paymentId ?? record.transactionId ?? "—"}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReturnedBooks;
