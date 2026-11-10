import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { TransactionRowType } from "../../types/AdminType";
import { getTransactions } from "../../services/transaction";
import { EmptyState, PageHeader, Spinner } from "../../components/common/ui";
import { formatDate } from "../../utils/format";

// Payment history; rows come ready to display from the server (admin route guard already applied)
function Transactions() {
  const [rows, setRows] = useState<TransactionRowType[] | null>(null);

  useEffect(() => {
    getTransactions().then((res) => {
      if (res.status === 200 && Array.isArray(res.data.payload)) setRows(res.data.payload as TransactionRowType[]);
      else {
        toast.error(res.data.message || "Failed to fetch transactions");
        setRows([]);
      }
    });
  }, []);

  if (rows === null) return <Spinner />;
  if (rows.length === 0) {
    return <EmptyState title="No Transactions" message="It looks like no fines have been paid in the library yet." />;
  }

  return (
    <div className="container">
      <PageHeader title="Fine Management" subtitle="Fines paid by your library's members" />
      <div className="border rounded-2 p-2 mb-4">
        <div className="table-responsive">
          <table className="table align-middle text-start mb-0">
            <caption className="caption-top px-2">Transactions <span className="badge rounded-pill bg-dark">{rows.length}</span></caption>
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th className="d-none d-sm-table-cell">Date</th>
                <th>Fine</th>
                <th className="d-none d-lg-table-cell">Transaction Id</th>
                <th className="d-none d-md-table-cell">Payment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td className="text-capitalize text-break">{row.username}</td>
                  <td className="text-break">{row.bookTitle}</td>
                  <td className="d-none d-sm-table-cell text-success fw-bold text-nowrap">{formatDate(row.createdAt)}</td>
                  <td className="text-warning fw-bold text-nowrap">₹{row.amount}</td>
                  <td className="d-none d-lg-table-cell small">{row.transactionId}</td>
                  <td className="d-none d-md-table-cell text-capitalize">
                    {row.paymentMethod}
                    {row.paymentReference && <span className="text-muted"> ({row.paymentReference})</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
