import { Col, Row } from 'react-bootstrap';
import { fetchUsers } from '../../store/UserContext';
import { fetchBooks } from '../../store/BooksContext';
import type { TransactionFormType } from '../../types/FineType';
import { useEffect, useState } from 'react';
import { useAuth } from '../../store/AuthContextProvider';
import toast from 'react-hot-toast';
import { getTransactionData } from '../../services/admin/TransactionDetails';

function Transactions() {
  const { currentUser } = useAuth();
  const { users, } = fetchUsers();
  const { books } = fetchBooks();

  const [transactions, setTransactions] = useState<TransactionFormType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // fetch users
  const username = (userId: string) => {
    let user = users.find(userObj => userObj._id === userId);
    return user ? user.username : "unknown user";
  };

  // fetch books
  const bookName = (bookId: string) => {
    let book = books.find(bookObj => bookObj._id === bookId);
    return book ? book.title : "unknown book";
  };

  // fetch transactions only if user is admin
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser || currentUser.role !== 'admin') {
        setLoading(false);
        return;
      }

      try {
        const resObj = await getTransactionData();
        if (resObj.status === 200 && resObj.data.payload) {
          setTransactions(resObj.data.payload as TransactionFormType[]);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        toast.error('Failed to fetch transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  // Show unauthorized if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "72vh" }}>
        <div className="card shadow-sm p-4 border-1" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center">
            <h5 className="fw-bold mb-2 text-danger">Access Denied</h5>
            <p className="text-muted mb-3">You do not have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "72vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {transactions.length !== 0 ? (
        <div>
          <div className="border py-3 rounded-2 mt-3 m-3 w-75 mx-auto">
            <Row>
              <Col className='mx-4'>
                <h2 className='text-start'>Fine Management</h2>
                <p className='text-muted text-start'>Manage your library's Members' fines</p>
              </Col>
              <Col className='mt-4 text-end px-5'>
                {/* <button className="btn btn-dark text-white">+Add Members</button> */}
              </Col>
            </Row>
          </div>
          <div className='border py-2 mt-4 w-75 mx-auto p-2'>
            <div className="table-responsive">
              <table className="table align-middle">
                <caption className='caption-top text-start fs-6 px-3'>
                  Transactions <span className='border rounded-5 py-1 px-2 bg-dark text-white'>{transactions.length}</span>
                </caption>
                <thead className='align-items-center'>
                  <tr>
                    <th colSpan={2}>User</th>
                    <th>Book</th>
                    <th>Return date</th>
                    <th>Fine</th>
                    <th>Transaction Id</th>
                    <th colSpan={4}>Payment type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transactionObj: TransactionFormType) => (
                    <tr key={transactionObj._id} style={{ color: "#F7F7F7" }}>
                      <td colSpan={2} className='align-middle text-capitalize'>
                        {username(transactionObj.userId)}
                      </td>
                      <td className='align-middle text-capitalize text-truncate'>
                        {transactionObj.payments[0] ? bookName(transactionObj.payments[0].bookId) : "N/A"}
                      </td>
                      <td className='align-middle text-success fw-bold'>
                        {transactionObj.payments[0] ? new Date(transactionObj.payments[0].createdAt || new Date()).toLocaleDateString() : "N/A"}
                      </td>
                      <td className='align-middle'>
                        <span className='text-warning fw-bold rounded-5 px-2 text-md-truncate'>
                          {transactionObj.payments[0]?.amount ?? 0}
                        </span>
                      </td>
                      <td className='align-middle'>{transactionObj._id}</td>
                      <td className='align-middle text-success fw-bold text-capitalize'>
                        {transactionObj.payments[0]?.paymentMethod ?? "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center mx-auto align-items-center flex-column text-center" style={{ minHeight: "72vh" }}>
          <div className="card shadow-sm p-4 border-1" style={{ maxWidth: "500px" }}>
            <div className="card-body">
              <h5 className="fw-bold mb-2">No Transactions....</h5>
              <p className="text-muted mb-3">It looks like there are no transactions happened in library</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
