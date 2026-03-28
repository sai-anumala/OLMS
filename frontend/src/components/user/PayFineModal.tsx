import { Modal, Button } from "react-bootstrap";
import type { BorrowedBookType } from "../../types/UserType";

type PropsType={
    fineDetails:BorrowedBookType;
    handlePayFine:()=>void
    onClose:()=>void;
}
function PayFineModal(props:PropsType) {
  const handlePayment = () => {
    // Add actual payment logic here
    alert(`Paid ₹${props.fineDetails.fine.toFixed(2)} for book ${props.fineDetails.bookId}`);
    props.handlePayFine();
    props.onClose();
  };

  return (
    <Modal show onHide={props.onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Pay Fine</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Book ID:</strong> {props.fineDetails.bookId}</p>
        <p><strong>Due Date:</strong> {props.fineDetails.dueDate}</p>
        <p><strong>Fine Amount:</strong> ₹{props.fineDetails.fine.toFixed(2)}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>Cancel</Button>
        <Button variant="primary" onClick={handlePayment}>Pay Now</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PayFineModal;
