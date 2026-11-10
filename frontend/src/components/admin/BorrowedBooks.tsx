import type { BorrowedItemType } from "../../types/AdminType";
import { formatDate } from "../../utils/format";

// Currently borrowed books across all members (rows prepared by /admin-api/dashboard)
function BorrowedBooks({ items }: { items: BorrowedItemType[] }) {
  return (
    <div className="my-4 text-start">
      <h2 className="h4 mb-3">Currently Borrowed Books ({items.length})</h2>
      {items.length === 0 ? (
        <div className="alert alert-success">No books are currently checked out.</div>
      ) : (
        items.map((item) => (
          <div key={`${item.borrowerId}-${item.bookId}`} className="border rounded mb-2 p-3 d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
            <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
              <img src={item.bookImage} alt="" className="rounded list-thumb" />
              <div className="min-w-0">
                <strong className="d-block text-break">{item.bookTitle}</strong>
                <span className="text-muted small">Author: {item.author}</span>
              </div>
            </div>
            <div className="text-sm-end flex-shrink-0">
              <div className="text-break">Borrowed by: <strong className="text-primary">{item.borrowerName}</strong></div>
              <div className={`small ${item.overdue ? "text-danger" : "text-muted"}`}>
                Due: {formatDate(item.dueDate)}{item.overdue && " (overdue)"}
              </div>
              {item.fine > 0 && <div className="text-danger fw-bold">Fine: ₹{item.fine.toFixed(2)}</div>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default BorrowedBooks;
