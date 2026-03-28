import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContextProvider";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loginStatus, pageLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loginStatus) {
      navigate("/login");
    }
    setIsChecking(false);
  }, [loginStatus, navigate]);

  if (isChecking || !loginStatus) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
