import { useAuth } from "../../store/AuthContextProvider";

function UserGreet() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const isAdmin = currentUser.role === "admin";
  return (
    <div className="text-start text-break">
      <h4 className="text-dark mb-2">
        {isAdmin ? "Welcome to the Admin Dashboard - " : "Welcome to Your Library Dashboard - "}
        <span className={isAdmin ? "text-warning fw-bold text-capitalize" : ""}>
          {isAdmin ? currentUser.username : currentUser.username.toUpperCase()}
        </span>
      </h4>
      <h6 className="text-muted">
        {isAdmin
          ? "Monitor and manage library books, users, and borrowing activity efficiently."
          : "Explore available books, track your borrowed items, and manage your reading journey."}
      </h6>
    </div>
  );
}

export default UserGreet;
