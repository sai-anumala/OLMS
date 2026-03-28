import { useAuth } from "../../store/AuthContextProvider"

function UserGreet() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div>
      {currentUser.role === "user" ? (
        <>
          <h4 className="text-dark text-start mb-2">
            Welcome to Your Library Dashboard -{currentUser.username.toUpperCase()}
          </h4>
          <h6 className="text-muted text-start">
            Explore available books, track your borrowed items, and manage your reading journey.
          </h6>
        </>
      ) : (
        <h4 className="text-dark text-start mb-2 text-capitalize">
          Welcome to the Admin Dashboard -{" "}
          <span className="text-warning fw-bold fs-2">{currentUser.username}</span>
        </h4>
      )}
    </div>
  );
}
export default UserGreet
