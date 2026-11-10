import { useNavigate } from "react-router";
import { useAuth } from "../../store/AuthContextProvider";
import { EmptyState } from "./ui";

function ErrorPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const home = currentUser ? `/${currentUser.role === "admin" ? "admin" : "user"}/dashboard` : "/books";

  return (
    <EmptyState tone="danger" title="Page Not Found"
      message="Sorry, the page you're looking for doesn't exist or might have been moved."
      actionLabel={currentUser ? "Go To Dashboard" : "Go To Home"} onAction={() => navigate(home)} />
  );
}

export default ErrorPage;
