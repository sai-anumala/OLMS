// import Welcome from "../../components/Welcome"

import { Card, CardBody, Col, Row } from "react-bootstrap"
import UserGreet from "../../components/user/UserGreet"
import { IoBookOutline, IoWarningOutline } from "react-icons/io5"
import { FaRegClock } from "react-icons/fa"
import { useEffect, useState } from "react"
import BorrowedBooks from "../../components/admin/BorrowedBooks"
import { IoIosPeople } from "react-icons/io"
import toast from "react-hot-toast"
import { getDashboard } from "../../services/admin"
import type { DashboardType } from "../../types/AdminType"
import { ImBooks } from "react-icons/im"
import { GrMoney } from "react-icons/gr"

function AdminDashboard() {

  // every number on this page is calculated by the server
  const [dashboard,setDashboard]=useState<DashboardType | null>(null)

  useEffect(()=>{
    const load=async()=>{
      const resObj=await getDashboard()
      if(resObj.status===200 && resObj.data.payload){
        setDashboard(resObj.data.payload as DashboardType)
      }
      else{
        toast.error(resObj.data.message)
      }
    }
    load()
  },[])

  const stats=dashboard?.stats

  return (
    <div className="container dashboard-container mt-3">
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
                            <Row><h4>{stats?.totalBooks ?? 0}</h4></Row>
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
                            <Row><h4>{stats?.totalMembers ?? 0}</h4></Row>
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
                            <Row><h4>{stats?.borrowedCount ?? 0}</h4></Row>
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
                            <Row><h4>{stats?.overdueCount ?? 0}</h4></Row>
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
                            <Row><h4>{stats?.collectedFines ?? 0}</h4></Row>
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
                            <Row><h3>{stats?.pendingFines ?? 0}</h3></Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>


        </div>
        <BorrowedBooks items={dashboard?.currentlyBorrowed ?? []}/>
    </div>
  )
}

export default AdminDashboard
