import { Card, CardBody, Col, Row } from "react-bootstrap"
import { useAuth } from "../../store/AuthContextProvider"
import { IoBookOutline, IoWarningOutline } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import UserGreet from "../../components/user/UserGreet";
import BorrowedBooks from "./BorrowedBooksList";
import type { BorrowedBookType } from "../../types/UserType";


function UserDashBoard() {

  const {currentUser}=useAuth()
  // overdue books count
  let overDueCount=0;
  let today=new Date();
  (currentUser?.borrowed_books || [])?.map((obj : BorrowedBookType)=>{
    let due=new Date(obj.dueDate)
    if(due<today){
      overDueCount+=1
    }
  })
  return (
    <div>
      <div className="container mt-4 w-75">
        <UserGreet/>
        {/* <div className=" d-flex gap-3 justify-content-around border-0 p-5 shadow flex-wrap  rounded-2 mb-3  "> */}
          <div className=" d-flex gap-3  justify-content-around p-2 flex-wrap  rounded-2 mb-3 ">
            <Card className="shadow rounded-4 flex-fill" style={{minWidth:"12rem",maxWidth:"16rem"}}>
                <CardBody>
                  <Row className="align-items-center">
                    <Col xs="4" className="text-center d-flex justify-content-center aligin-items-center">
                      <IoBookOutline className=" text-primary fs-1 mx-auto"  />
                    </Col>
                    <Col xs="8">
                    <h5 className="text-center">Currently Borrowed</h5>
                    <h4>{currentUser?.borrowed_books?.length}</h4>
                    </Col>
                  </Row>
                </CardBody>
            </Card>
          <Card className="shadow rounded-4 flex-fill" style={{minWidth:"12rem",maxWidth:"16rem"}}>            
            <CardBody>
                  <Row className="align-items-center d-flex justify-content-center aligin-items-center">
                    <Col xs="4" className="text-center">
                      <IoWarningOutline className=" text-warning fs-1 mx-auto "/>
                    </Col>
                    <Col xs="8">
                    <h5 className="text-center">Over Due Books</h5>
                    <h4>{overDueCount}</h4>
                    </Col>
                  </Row>
                </CardBody>
            </Card>
            <Card className="shadow rounded-4 flex-fill" style={{minWidth:"12rem",maxWidth:"16rem"}}>           
                <CardBody>
                  <Row className="align-items-center d-flex justify-content-center aligin-items-center">
                    <Col xs="4" className="text-center">
                      <FaRegClock className="text-success fs-1 mx-auto mt-3"/>
                    </Col>
                    <Col xs="8">
                    <h5 className="">Total Fines</h5>
                    <h4>{currentUser?.fine}</h4>
                    </Col>
                  </Row>
                </CardBody>
            </Card>
        </div>
      </div>
      <BorrowedBooks/>
    </div>
  )
}

export default UserDashBoard
