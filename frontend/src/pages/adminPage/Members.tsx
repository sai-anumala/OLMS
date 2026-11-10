import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { TiEdit } from "react-icons/ti";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdBlock } from "react-icons/md";
import { useUsers } from "../../store/UserContext";
import type { UserType } from "../../types/UserType";
import { PageHeader } from "../../components/common/ui";

function Members() {
  const { users, updateUserInfo, deleteUser, holdUser } = useUsers();
  const [editing, setEditing] = useState<UserType | null>(null);
  const { register, formState: { errors }, handleSubmit, reset } = useForm<UserType>();

  useEffect(() => {
    if (editing) reset(editing);
  }, [editing, reset]);

  const save = async (data: UserType) => {
    await updateUserInfo(data);
    setEditing(null);
  };

  const toggleHold = (user: UserType) => {
    const action = user.status === false ? "re-activate" : "put on hold";
    if (user._id && window.confirm(`Do you want to ${action} ${user.username}?`)) holdUser(user._id);
  };

  const remove = (user: UserType) => {
    if (user._id && window.confirm(`Delete ${user.username} permanently? This cannot be undone.`)) deleteUser(user._id);
  };

  return (
    <div className="container">
      <PageHeader title="Members Management" subtitle="Manage your library's members" />
      <div className="border rounded-2 p-2 mb-4">
        <div className="table-responsive">
          <table className="table align-middle text-start mb-0">
            <caption className="caption-top px-2">Members <span className="badge rounded-pill bg-dark">{users.length}</span></caption>
            <thead>
              <tr>
                <th>Member</th>
                <th className="d-none d-md-table-cell">Email</th>
                <th className="d-none d-lg-table-cell">Mobile</th>
                <th className="d-none d-sm-table-cell">Borrowed</th>
                <th>Fines</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="text-break">
                    {user.username}
                    {user.role === "admin" && <span className="badge bg-dark ms-2">admin</span>}
                    {user.status === false && <span className="badge bg-warning text-dark ms-2">on hold</span>}
                    <div className="d-md-none small text-muted text-break">{user.email}</div>
                  </td>
                  <td className="d-none d-md-table-cell text-break">{user.email}</td>
                  <td className="d-none d-lg-table-cell">{user.mobile}</td>
                  <td className="d-none d-sm-table-cell">{user.summary?.borrowedCount ?? 0}</td>
                  <td><span className="badge rounded-pill bg-danger">₹{user.summary?.totalFine ?? 0}</span></td>
                  <td>
                    <div className="d-flex flex-nowrap">
                      <button className="btn btn-sm" title="Edit member" onClick={() => setEditing(user)}><TiEdit className="fs-5" /></button>
                      {user.role !== "admin" && (
                        <>
                          <button className="btn btn-sm" title={user.status === false ? "Re-activate member" : "Put member on hold"} onClick={() => toggleHold(user)}>
                            <MdBlock className={`fs-5 ${user.status === false ? "text-success" : "text-warning"}`} />
                          </button>
                          <button className="btn btn-sm" title="Delete member" onClick={() => remove(user)}><RiDeleteBinLine className="fs-5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={editing !== null} onHide={() => setEditing(null)} centered>
        <Modal.Header closeButton><Modal.Title as="h4">Member Details</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(save)} noValidate>
            <div className="mb-3">
              <input type="text" placeholder="Username" className={`form-control ${errors.username ? "is-invalid" : ""}`}
                {...register("username", { required: "Username is required" })} />
              <div className="invalid-feedback">{errors.username?.message}</div>
            </div>
            <div className="mb-3">
              <input type="tel" placeholder="Mobile Number" className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                {...register("mobile", { required: "Mobile number is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number" } })} />
              <div className="invalid-feedback">{errors.mobile?.message}</div>
            </div>
            <div className="mb-3">
              <input type="email" placeholder="Email" className={`form-control ${errors.email ? "is-invalid" : ""}`}
                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" } })} />
              <div className="invalid-feedback">{errors.email?.message}</div>
            </div>
            <button type="submit" className="btn btn-dark w-100">Update</button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Members;
