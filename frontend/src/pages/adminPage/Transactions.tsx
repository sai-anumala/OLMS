import { Col, Row } from 'react-bootstrap';
import type { TransactionRowType } from '../../types/AdminType';
import { useEffect, useState } from 'react';
import { useAuth } from '../../store/AuthContextProvider';
import toast from 'react-hot-toast';
import { getTransactionData } from '../../services/admin/TransactionDetails';

function Transactions() {
  const { currentUser } = useAuth();

  // one row per payment, with member and book names, prepared and sorted by the server
  const [paymentRows, setPaymentRows] = useState<TransactionRowType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser || currentUser.role !== 'admin') {
        setLoading(false);
        return;
      }
      const resObj = await getTransactionData();
      if (resObj.status === 200 && Array.isArray(resObj.data.payload)) {
        setPaymentRows(resObj.data.payload as TransactionRowType[]);
      } else {
        toast.error(resObj.data.message || 'Failed to fetch transactions');
        setPaymentRows([]);
      }
      setLoading(false);
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
      {paymentRows.length !== 0 ? (
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
                  Transactions <span className='border rounded-5 py-1 px-2 bg-dark text-white'>{paymentRows.length}</span>
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
                  {paymentRows.map((row) => (
                    <tr key={row._id} style={{ color: "#F7F7F7" }}>
                      <td colSpan={2} className='align-middle text-capitalize'>
                        {row.username}
                      </td>
                      <td className='align-middle text-capitalize text-truncate'>
                        {row.bookTitle}
                      </td>
                      <td className='align-middle text-success fw-bold'>
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className='align-middle'>
                        <span className='text-warning fw-bold rounded-5 px-2 text-md-truncate'>
                          {row.amount}
                        </span>
                      </td>
                      <td className='align-middle'>{row.transactionId}</td>
                      <td className='align-middle text-success fw-bold text-capitalize'>
                        {row.paymentMethod}
                        {row.paymentReference && <span className='text-muted fw-normal'> ({row.paymentReference})</span>}
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
