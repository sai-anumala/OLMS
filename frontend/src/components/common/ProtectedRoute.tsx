import { Navigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContextProvider";

type ProtectedRouteProps = {
  children: React.ReactNode;
  role: "user" | "admin"; // which kind of account may open these pages
};

// Render children only for a logged-in user with the given role; spinner while the session restores
function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { currentUser, loginStatus, pageLoading } = useAuth();

  if (pageLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!loginStatus || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // logged in, but with the wrong role: send them to their own dashboard
  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === "admin" ? "/admin" : "/user"} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
