import { useNavigate } from "react-router"
import { useAuth } from "../../store/AuthContextProvider"

function ErrorPage() {

  const {currentUser}=useAuth()
  const navigate=useNavigate()
 
  return (
     <div className="d-flex justify-content-center mx-auto align-items-center flex-column text-center"
                            style={{ minHeight: "72vh" }}>
        <div className="card shadow-sm p-4 border-1" style={{ maxWidth: "500px" }}>
            <div className="card-body">
                
                {currentUser ? currentUser.role==="user" ? 
                  (
                    <>
                      <h2 className="text-danger">Page Not Found</h2>
                      <p className="text-muted mb-3">
                        Sorry, the page you're looking for doesn't exist or might have been moved.
                      </p>
                      <button className="btn btn-success" onClick={() => navigate("/user/dashboard")}>
                        Go To Dashboard
                      </button>
                    </>
                    
                  ):(
                      <>
                        <h2 className="text-danger">Page Not Found</h2>
                        <p className="text-muted mb-3">
                          Sorry, the page you're looking for doesn't exist or might have been moved.
                        </p>
                        <button className="btn btn-success" onClick={() => navigate("/admin/dashboard")}>
                          Go To Dashboard
                        </button>
                      </>
                  ):(
                  <>
                    <h2 className="text-danger">Page Not Found</h2>
                    <p className="text-muted mb-3">
                      Sorry, the page you're looking for doesn't exist or might have been moved.
                    </p>
                    <button className="btn btn-success" onClick={() => navigate("/books")}>
                      Go To Home
                    </button>
                  </>
                )
                     
                }
            </div>
        </div>
      </div>
  )
}

export default ErrorPage

