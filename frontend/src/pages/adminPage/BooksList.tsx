import { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { fetchBooks } from '../../store/BooksContext'
import { TiEdit } from 'react-icons/ti'
import { IoStarHalfSharp } from 'react-icons/io5'
import AddBook from "../../components/admin/AddBook";
import BookEdit from '../../components/admin/BookEdit'
import { VscEye, VscEyeClosed } from 'react-icons/vsc'
import { RiDeleteBinLine } from 'react-icons/ri'
import { LiaTrashRestoreSolid } from 'react-icons/lia'
 
function BooksList() {
  //  states to update
  const [showModal,setShowModal]=useState<boolean>(false)
  const [showEditModal,setShowEditModal]=useState<boolean>(false)
  const [editBookId,setEditBookId]=useState<string >("")
  
  // books data and deleteBook function from context
  const {books,deleteBook,updateBookStatus}=fetchBooks()

  // function to handle add book modal 
  const handleShow=()=>setShowModal(true);
  const handleClose=()=>setShowModal(false)

  // functions to handle edit modal
  const handleEditShow=()=>setShowEditModal(true);
  const handleEditClose=()=>setShowEditModal(false);
 
  // to delete books
  const handleDeleteBook=async(id:string)=>deleteBook(id)

  // update book status
  const handleBookStatus=async(id:string)=>updateBookStatus(id)

  // FUCNTION TO HANDLE EDIT BOOK MODAL
  const handleEditBookModal=(bookId:string)=>{
    handleEditShow()
    setEditBookId(bookId)
  }

  return (
    <div>      
      <AddBook show={showModal} onHide={handleClose}/>
      <div className='border py-3 rounded-2 mt-3 m-3 w-75 mx-auto'>
      <Row>
          <Col className='mx-4' >
            <h2 className='text-start'>Book Management</h2>
            <p className='text-muted text-start'>Manage your library's book collection</p>
          </Col>
          <Col className='mt-4 text-end px-5'>
            <button className='btn btn-dark text-white 'onClick={handleShow}>+ Add Books</button>
          </Col>
      </Row>
      </div>

      <div className='border py-2 mt-4 w-75 mx-auto p-2'>
        <div className="table-responsive">
          <table className='table align-middle'>
            <caption className='caption-top text-start fs-6 px-3'>Books <span className='border rounded-5 px-2 bg-dark text-white'>{books.length}</span></caption>
            <thead>
              <tr>
                <th colSpan={3}>Book Title</th>
                <th colSpan={2}>Author</th> 
                <th>Genre</th>
                <th colSpan={2}>ISBN</th>
                <th>Status</th>
                <th>Availability</th>
                <th>Rating</th>
                <th colSpan={4}>Actions</th>
              </tr>
            </thead>
          
            <tbody>
              {
                books.map((bookobj)=>(
                  <tr key={bookobj.isbn}>
                  
                    <td colSpan={3} className='align-middle'>
                      <Row className='g-4 align-items-center flex-nowrap'>
                        <Col >
                          <img src={bookobj.image}  width="100rem" height="80px" style={{objectFit:'cover'}} />
                        </Col>
                        <Col className='ms-3'>{bookobj.title}</Col>
                      </Row>
                    </td>
                  
                    {/* Standard Table Data */}
                    <td className='align-middle' colSpan={2}>{bookobj.author}</td>
                    <td className='align-middle'>{bookobj.genre}</td>
                    <td colSpan={2} className='align-middle'>{bookobj.isbn}</td>
                    <td className='align-middle'>{bookobj.status ? <p className='text-success fw-bold text-sm'>Active</p> : <p className='fw-bold text-danger'>In-Active</p>}</td>
                    <td className='align-middle'><span className=' bg-dark text-white rounded-5 px-2 '>{bookobj.availability}</span></td>
                    <td className='align-middle'>{bookobj.rating} <IoStarHalfSharp className='mb-1'/></td>
                  
                    <td colSpan={4} className='align-middle'>
                      <div className='d-flex flex-nowrap'>
                        <button className='btn'><TiEdit className='fs-5' onClick={()=>{if(bookobj._id){handleEditBookModal(bookobj._id)}}}/></button>
                        <button className='btn' onClick={()=>{
                          if(bookobj._id){
                            handleBookStatus(bookobj._id)
                          }
                        }}>{bookobj.status ? <VscEyeClosed  className='fs-4'/> : <VscEye className='fs-4'/>}</button>
                        
                        {/* delete book */}
                        <button className='btn'onClick={()=>{
                          if(bookobj._id){
                            handleDeleteBook(bookobj._id)
                          }
                        }}>{bookobj.isDelete===false ?<RiDeleteBinLine className='fs-4 text-danger'/> : <LiaTrashRestoreSolid className='fs-4 text-success' />}</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      <BookEdit showEditModal={showEditModal} onHideEditModal={handleEditClose} bookId={editBookId}/>
    </div>
  )
}
 
export default BooksList
