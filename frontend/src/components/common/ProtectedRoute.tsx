import { Navigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContextProvider";
import { Spinner } from "./ui";

type ProtectedRouteProps = {
  children: React.ReactNode;
  role: "user" | "admin";
};

// Render children only for a logged-in user with the given role; spinner while the session restores
function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { currentUser, loginStatus, pageLoading } = useAuth();

  if (pageLoading) return <Spinner fullScreen />;
  if (!loginStatus || !currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to={currentUser.role === "admin" ? "/admin" : "/user"} replace />;
  return <>{children}</>;
}

export default ProtectedRoute;
