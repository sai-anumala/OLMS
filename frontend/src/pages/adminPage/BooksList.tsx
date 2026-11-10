import { useEffect, useState } from "react";
import { TiEdit } from "react-icons/ti";
import { IoStarHalfSharp } from "react-icons/io5";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { RiDeleteBinLine } from "react-icons/ri";
import { LiaTrashRestoreSolid } from "react-icons/lia";
import { useBooks } from "../../store/BooksContext";
import type { BookType } from "../../types/BookType";
import BookFormModal from "../../components/admin/BookFormModal";
import { PageHeader } from "../../components/common/ui";

function BooksList() {
  const { managedBooks: books, fetchManagedBooks, deleteBook, updateBookStatus } = useBooks();
  const [form, setForm] = useState<{ show: boolean; book?: BookType }>({ show: false });

  // every book, including removed ones, comes from the admin endpoint
  useEffect(() => {
    fetchManagedBooks();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  return (
    <div className="container">
      <PageHeader title="Book Management" subtitle="Manage your library's book collection"
        action={<button className="btn btn-dark text-nowrap" onClick={() => setForm({ show: true })}>+ Add Book</button>} />

      <div className="border rounded-2 p-2 mb-4">
        <div className="table-responsive">
          <table className="table align-middle text-start mb-0">
            <caption className="caption-top px-2">Books <span className="badge rounded-pill bg-dark">{books.length}</span></caption>
            <thead>
              <tr>
                <th>Book</th>
                <th className="d-none d-md-table-cell">Author</th>
                <th className="d-none d-lg-table-cell">Genre</th>
                <th className="d-none d-xl-table-cell">ISBN</th>
                <th>Status</th>
                <th className="d-none d-sm-table-cell">Available</th>
                <th className="d-none d-lg-table-cell">Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className={book.isDelete ? "opacity-50" : ""}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img src={book.image} alt="" className="rounded table-thumb" />
                      <span className="text-break">{book.title}</span>
                    </div>
                  </td>
                  <td className="d-none d-md-table-cell">{book.author}</td>
                  <td className="d-none d-lg-table-cell">{book.genre}</td>
                  <td className="d-none d-xl-table-cell text-nowrap">{book.isbn}</td>
                  <td>
                    {book.isDelete ? <span className="text-muted fw-bold">Removed</span>
                      : book.status ? <span className="text-success fw-bold">Active</span>
                      : <span className="text-danger fw-bold">Inactive</span>}
                  </td>
                  <td className="d-none d-sm-table-cell"><span className="badge rounded-pill bg-dark">{book.availability}</span></td>
                  <td className="d-none d-lg-table-cell text-nowrap">{book.rating} <IoStarHalfSharp className="mb-1" /></td>
                  <td>
                    <div className="d-flex flex-nowrap">
                      <button className="btn btn-sm" title="Edit" onClick={() => setForm({ show: true, book })}><TiEdit className="fs-5" /></button>
                      <button className="btn btn-sm" title={book.status ? "Make inactive" : "Make active"} onClick={() => book._id && updateBookStatus(book._id)}>
                        {book.status ? <VscEyeClosed className="fs-5" /> : <VscEye className="fs-5" />}
                      </button>
                      <button className="btn btn-sm" title={book.isDelete ? "Restore" : "Remove"} onClick={() => book._id && deleteBook(book._id)}>
                        {book.isDelete ? <LiaTrashRestoreSolid className="fs-5 text-success" /> : <RiDeleteBinLine className="fs-5 text-danger" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <BookFormModal show={form.show} book={form.book} onHide={() => setForm({ show: false })} />
    </div>
  );
}

export default BooksList;
