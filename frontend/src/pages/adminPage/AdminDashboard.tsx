// import Welcome from "../../components/Welcome"

import { Card, CardBody, Col, Row } from "react-bootstrap"
import UserGreet from "../../components/user/UserGreet"
import { IoBookOutline, IoWarningOutline } from "react-icons/io5"
import { FaRegClock } from "react-icons/fa"
import { fetchUsers } from "../../store/UserContext"
import { useEffect, useState } from "react"
import BorrowedBooks from "../../components/admin/BorrowedBooks"
import { IoIosPeople } from "react-icons/io"
import { fetchBooks } from "../../store/BooksContext"
import { ImBooks } from "react-icons/im"
import { GrMoney } from "react-icons/gr"

function AdminDashboard() {

  // users data
  const{users}=fetchUsers()
  const {books}=fetchBooks()
  //  to calculate total borrow and fines and overdues 
  const [currentlyBorrowedBooks, setCurrentlyBorrowedBooks]=useState<number>(0);
  const [overdueBooks, setOverdueBooks]=useState<number>(0);
  const [totalFines, setTotalFines]=useState<number>(0);
  const [collectedFines,setCollectedFines]=useState<number>(0);

  useEffect(()=>{
    let borrowedCount=0;
    let overdueCount=0;
    let finesTotal=0;
    let collectedFine=0;
    const today=new Date();

    if(users){
      users.map((userObj)=>{
        if(userObj.borrowed_books){
          borrowedCount+=userObj.borrowed_books.length;
          userObj.borrowed_books.map((borrowObj)=>{
            const dueDate=new Date(borrowObj.dueDate);
             if (today.getTime()>dueDate.getTime()) {
              overdueCount+=1;
            }
            if(borrowObj.fine>1){
              finesTotal+=borrowObj.fine;
            }
            // return borrowObj
          })
        }
        // return userObj
      })

    // paid fine total
    users.map(userObj=>{
        if(userObj && userObj.return_books){
            userObj.return_books.map(obj=>{
                return collectedFine+=obj.fine
            })
        }
        
    })
      
    }

    setCurrentlyBorrowedBooks(borrowedCount);
    setOverdueBooks(overdueCount);
    setTotalFines(finesTotal);
    setCollectedFines(collectedFine)
  },[users])


  return (
    <div className="container w-75 mt-3">
        {/* <Welcome/> */}
        <UserGreet />
        <h6 className="text-muted text-start">Monitor and manage library books, users, and borrowing activity efficiently..</h6>

        <div className="border py-4 px-4 mx-auto rounded-2 mt-3 d-flex flex-wrap justify-content-between gap-4"  style={{maxWidth:"55rem"}}>
            
            {/* Total Books */}
            <Card className="shadow rounded-4 flex-fill" style={{minWidth:"12rem",maxWidth:"14rem"}}>
                <CardBody>
                    <Row className="align-items-center">
                        <Col xs="4" className="text-center">
                            <ImBooks className="text-dark fs-3" />
                        </Col>
                        <Col xs="8">
                            <Row><h6 className="text-start mb-0">Total Books</h6></Row>
                            <Row><h4>{books.length}</h4></Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Total Members */}
            <Card className="shadow rounded-4 flex-fill" style={{minWidth:"12rem",maxWidth:"14rem"}}>
                <CardBody>
                    <Row className="align-items-center">
                        <Col xs="4" className="text-center">
                            <IoIosPeople  className="text-primary fs-3" />
                        </Col>
                        <Col xs="8">
                            <Row><h6 className="text-start mb-0">Total Members</h6></Row>
                            <Row><h4>{users.length}</h4></Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/*  Currently Borrowed */}
            <Card className="shadow rounded-4 flex-fill" style={{ minWidth:"12rem", maxWidth:"14rem" }}>
                <CardBody>
                    <Row className="align-items-center">
                        <Col xs="4" className="text-center">
                            <IoBookOutline className="text-primary fs-3" /> 
                        </Col>
                        <Col xs="8">
                            <Row><h6 className="text-start mb-0"> Borrowed</h6></Row>
                            <Row><h4>{currentlyBorrowedBooks}</h4></Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Over Dues */}
            <Card className="shadow rounded-4 flex-fill" style={{ minWidth:"12rem",maxWidth:"14rem" }}>
                <CardBody>
                    <Row className="align-items-center">
                        <Col xs="4" className="text-center">
                            <IoWarningOutline className="text-warning fs-3" />
                        </Col>
                        <Col xs="8">
                            <Row><h6 className="text-start mb-0">Over Dues</h6></Row>
                            <Row><h4>{overdueBooks}</h4></Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card className="shadow rounded-4 flex-fill" style={{minWidth:"12rem",maxWidth:"14rem" }}>
                <CardBody>
                    <Row className="align-items-center">
                        <Col xs="4" className="text-center">
                            <GrMoney className="text-success fs-3" />
                        </Col>
                        <Col xs="8">
                            <Row><h6 className="text-start mb-0">Collected Fines</h6></Row>
                            <Row><h4>{collectedFines}</h4></Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Total Fines */}
            <Card className="shadow rounded-4 flex-fill" style={{minWidth:"12rem",maxWidth:"14rem" }}>
                <CardBody>
                    <Row className="align-items-center">
                        <Col xs="4" className="text-center">
                            <FaRegClock className="text-success fs-3" />
                        </Col>
                        <Col xs="8">
                            <Row><h6 className="text-start mb-0">Pending Fines</h6></Row>
                            <Row><h3>{totalFines}</h3></Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>


        </div>
        <BorrowedBooks/>
    </div>
  )
}

export default AdminDashboard
