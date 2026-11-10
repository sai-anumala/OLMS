import type { BorrowedItemType } from "../../types/AdminType";

type BorrowedBooksProps = {
    items: BorrowedItemType[]; // prepared by the server (see /admin-api/dashboard)
};

function BorrowedBooks({ items }: BorrowedBooksProps) {
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Currently Borrowed Books ({items.length})</h2>
            <hr />

            {items.length===0 ?(
                <div className="alert alert-success">No books are currently checked out.</div>
            ):(
                <div>
                    {items.map((item) => (
                        <div key={`${item.borrowerId}-${item.bookId}`} className="border mb-1 d-flex flex-wrap gap-2 align-items-center justify-content-between p-3">
                            <div className="d-flex align-items-center flex-grow-1">
                                <img 
                                    src={item.bookImage} 
                                    alt={item.bookTitle} 
                                    style={{ width:'80px',height:'80px',objectFit:'cover',marginRight:'20px'}}/>
                                <div>
                                    <strong className="d-block">{item.bookTitle}</strong> 
                                    <p className="text-muted mb-0 small">Author: {item.author}</p>
                                </div>
                            </div>

                            <div className="text-end">
                                <p className="mb-1">Borrowed by: <strong className="text-primary">{item.borrowerName}</strong></p>
                                <p className={`mb-0 small ${item.overdue ? 'text-danger' : 'text-muted'}`}>Due Date: {new Date(item.dueDate).toLocaleDateString()}{item.overdue && " (overdue)"}</p>
                                {item.fine>0 && (
                                    <p className="mb-0  text-danger fw-bold">Fine: ₹ {item.fine.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BorrowedBooks;
