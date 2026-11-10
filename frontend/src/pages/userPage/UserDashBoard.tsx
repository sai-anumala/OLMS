import { IoBookOutline, IoWarningOutline } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import { useAuth } from "../../store/AuthContextProvider";
import UserGreet from "../../components/user/UserGreet";
import { StatCard } from "../../components/common/ui";
import BorrowedBooksList from "./BorrowedBooksList";

function UserDashBoard() {
  const { currentUser } = useAuth();
  const summary = currentUser?.summary; // calculated by the server

  return (
    <div>
      <div className="container pt-4">
        <UserGreet />
        <div className="row row-cols-2 row-cols-md-3 g-3 my-2">
          <div className="col"><StatCard icon={<IoBookOutline className="text-primary" />} label="Currently Borrowed" value={summary?.borrowedCount ?? 0} /></div>
          <div className="col"><StatCard icon={<IoWarningOutline className="text-warning" />} label="Overdue Books" value={summary?.overdueCount ?? 0} /></div>
          <div className="col"><StatCard icon={<FaRegClock className="text-success" />} label="Total Fines" value={`₹${summary?.totalFine ?? 0}`} /></div>
        </div>
      </div>
      <BorrowedBooksList />
    </div>
  );
}

export default UserDashBoard;
