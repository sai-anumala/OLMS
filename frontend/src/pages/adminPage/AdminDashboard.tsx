import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoBookOutline, IoWarningOutline } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { ImBooks } from "react-icons/im";
import { GrMoney } from "react-icons/gr";
import UserGreet from "../../components/user/UserGreet";
import BorrowedBooks from "../../components/admin/BorrowedBooks";
import { StatCard } from "../../components/common/ui";
import { getDashboard } from "../../services/admin";
import type { DashboardType } from "../../types/AdminType";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardType | null>(null); // calculated by the server

  useEffect(() => {
    getDashboard().then((res) => {
      if (res.status === 200 && res.data.payload) setDashboard(res.data.payload as DashboardType);
      else toast.error(res.data.message);
    });
  }, []);

  const stats = dashboard?.stats;
  const cards = [
    { icon: <ImBooks className="text-dark" />, label: "Total Books", value: stats?.totalBooks },
    { icon: <IoIosPeople className="text-primary" />, label: "Total Members", value: stats?.totalMembers },
    { icon: <IoBookOutline className="text-primary" />, label: "Borrowed", value: stats?.borrowedCount },
    { icon: <IoWarningOutline className="text-warning" />, label: "Overdue", value: stats?.overdueCount },
    { icon: <GrMoney className="text-success" />, label: "Collected Fines", value: `₹${stats?.collectedFines ?? 0}` },
    { icon: <FaRegClock className="text-success" />, label: "Pending Fines", value: `₹${stats?.pendingFines ?? 0}` },
  ];

  return (
    <div className="container pt-4">
      <UserGreet />
      <div className="row row-cols-2 row-cols-md-3 g-3 my-2">
        {cards.map((card) => (
          <div className="col" key={card.label}><StatCard icon={card.icon} label={card.label} value={card.value ?? 0} /></div>
        ))}
      </div>
      <BorrowedBooks items={dashboard?.currentlyBorrowed ?? []} />
    </div>
  );
}

export default AdminDashboard;
