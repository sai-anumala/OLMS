import  { useEffect, useState } from 'react'
import { Button, Col, Modal, Row } from 'react-bootstrap'
import { fetchUsers } from '../../store/UserContext';
import { TiEdit } from 'react-icons/ti';
import { RiDeleteBinLine } from 'react-icons/ri';
import { AiOutlineClose } from 'react-icons/ai';
import { useForm } from 'react-hook-form';
import type { UserType } from '../../types/UserType';
import { MdBlock } from 'react-icons/md';

function Members() {
  //fetching users
  const {users,updateUserInfo,deleteUser}=fetchUsers();
  //to show userModal
  let [showUserModal,setShowUserModal]=useState<boolean>(false);
  const [selectedUser,setSelectedUser]=useState<UserType>();

  //function to open modal
  function handleOpenUser(){
        setShowUserModal(true)
  }
  function handleCloseuser(){
      setShowUserModal(false)
  }

  function updateUser(userData:UserType){
    handleOpenUser();
    setSelectedUser(userData)
  }

  // form
  const {register,formState:{errors},handleSubmit,reset}=useForm<UserType>({
    defaultValues:selectedUser
  })

  useEffect(()=>{
         if(selectedUser){ reset(selectedUser)}
      },[selectedUser,reset])

  // handle update data
  async function handleUpdateUserData(updatedData:UserType){
    updateUserInfo(updatedData)
  }

  return (
    <div>
      <div className="border py-3 rounded-2 mt-3 m-3 w-75 mx-auto">
        <Row>
          <Col className='mx-4'>
          <h2 className='text-start'>Members Management</h2>
          <p className='text-muted text-start'>Manage your library's Members</p>
          </Col>
          <Col className='mt-4 text-end px-5'>
          {/* <button className="btn btn-dark text-white">+Add Members</button> */}
          </Col>
        </Row>
      </div>
       <div className='border py-2 mt-4 w-75 mx-auto p-2'>
          <div className="table-responsive">
          <table className="table align-middle">
             <caption className='caption-top text-start fs-6 px-3'>Members <span className='border rounded-5 py-1 px-2 bg-dark text-white'>{users.length}</span></caption>
             <thead className='align-items-center'>
                     <tr>
                       <th colSpan={2}>Member</th>
                       <th >Email</th>
                       <th>Mobile</th>
                       
                       {/* <th colSpan={3}>Join Date</th> */}
                       <th>Books Borrowed</th>
                       <th>Outstanding Fines</th>
                       <th colSpan={4}>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {
                       users.map((userobj)=>(
                         <tr key={userobj._id}>
                           <td colSpan={2} className='align-middle'>
                            {userobj.username}
                           </td>
                           <td className='align-middle'>{userobj.email}</td>
                           <td className='align-middle'>{userobj.mobile}</td>
                           <td  className='align-middle'>{userobj.borrowed_books?.length}</td>
                           <td  className='align-middle'><span className=' bg-danger text-white rounded-5 px-2 '>{userobj.fine}</span></td>
                           <td colSpan={4} className='align-middle'>
                             <div className='d-flex flex-nowrap'>
                               <button className='btn' onClick={()=>updateUser(userobj)}><TiEdit className='fs-5'/></button>
                               <button className="btn" ><MdBlock className='text-warning fs-5 hold'/></button>
                                <button className='btn'><RiDeleteBinLine className='fs-5' onClick={()=>{if(userobj._id){deleteUser(userobj._id)}}}/></button>
                             </div>
                           </td>
                         </tr>
                       ))
                     }
                   </tbody>
          </table>
          </div>
       </div>

          {/* update user data */}
        <Modal show={showUserModal} className="ml-3">
     
          <Modal.Body >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>User Details</h4>
              <Button variant="outline-secondary" size="sm" onClick={handleCloseuser}>
                <AiOutlineClose />
              </Button>
            </div>
            {/* form to update */}
            <form className='form' onSubmit={handleSubmit(handleUpdateUserData)}>
                <div className="mb-3">
              <input type="text" placeholder="Enter Username" className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                {...register('username', { required: 'Username is required' })}/>
            </div>

            {/* mobile number */}
            <div className="col mb-3">
              <input
                type="tel"
                placeholder="Mobile Number"
                className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                {...register('mobile', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit mobile number'
                  }
                })}
              />
            </div>
            
            <div className="mb-3">
              <input type="email" placeholder="Email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email format'
                  }
                })}/>
            </div>
            <button type="submit" className="btn btn-dark text-white w-100" >Update</button>
            </form>
          </Modal.Body>
       </Modal>  
    </div>
  )
}

export default Members
