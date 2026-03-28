import { Button, Offcanvas } from "react-bootstrap";
import { useAuth } from "../../store/AuthContextProvider";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { UserType } from "../../types/UserType";
import { useNavigate } from "react-router-dom";

//form data type
type ProfileFormData = {
  username: string;
  email: string;
  mobile: string;
  password?: string;
};

//props for the Offcanvas component
type ProfileProps = {
  showCanvas: boolean;
  handleClose: () => void;
};

function Profile({ showCanvas, handleClose }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser, updateUser, userLogout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      mobile: currentUser?.mobile || "",
      //   password: "",
    },
  });

  // useeffect to reset form when Offcanvas opens (showcanvas changes)
  useEffect(() => {
    if (showCanvas) {
      // setting default values from currentUser when opening
      reset({
        username: currentUser?.username || "",
        email: currentUser?.email || "",
        mobile: currentUser?.mobile || "",
        // password: "",
      });
      setIsEditing(false);
    }
  }, [showCanvas, currentUser, reset]);

  const handleEditOpen = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      mobile: currentUser?.mobile || "",
      password: "",
    });
  };

  const onSubmit = (data: ProfileFormData) => {
    if (!currentUser) return;

    const updatedUser: UserType = {
      ...currentUser,
      ...data,
      //...passwordUpdate,
      role: currentUser.role ?? "user",
    };

    updateUser(updatedUser);
    setIsEditing(false);
    handleClose(); // Close the offcanvas
    // toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    userLogout();
    navigate("/");
    handleClose();
    // toast.success("Logged out successfully!");
  };

  if (!currentUser) return null;

  return (
    <Offcanvas
      show={showCanvas}
      onHide={handleClose}
      placement="end"
      className="profile-offcanvas"
    >
      <Offcanvas.Header closeButton className="bg-light" />
      <Offcanvas.Body className="bg-light">
        <div className="p-4 bg-white mx-auto profile-card-container">
          {/* avatar and role */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle d-inline-flex justify-content-center align-items-center mt-3 profile-avatar-circle" // Avatar styling
            >
              <span className="profile-avatar-initial">
                {currentUser.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h5 className="mt-2 mb-1 fw-bold text-capitalize">
              {currentUser.username}
            </h5>
            <span className="badge bg-success text-uppercase">
              {currentUser.role}
            </span>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-muted">Username</span>
              {isEditing ? (
                <div className="w-50 text-end">
                  <input
                    type="text"
                    className={`form-control ${
                      errors.username ? "is-invalid" : ""
                    }`}
                    {...register("username", {
                      required: "Username is required",
                      minLength: { value: 3, message: "Minimum 3 characters" },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message:
                          "Only letters, numbers, and underscores allowed",
                      },
                    })}
                  />
                  {errors.username && (
                    <div className="text-danger small mt-1">
                      {errors.username.message}
                    </div>
                  )}
                </div>
              ) : (
                <span className="fw-semibold text-end">
                  {currentUser.username}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-muted">Email</span>
              {isEditing ? (
                <div className="w-50 text-end">
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="text-danger small mt-1">
                      {errors.email.message}
                    </div>
                  )}
                </div>
              ) : (
                <span className="fw-semibold text-end">
                  {currentUser.email}
                </span>
              )}
            </div>

            {/* Mobile */}
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-muted">Mobile</span>
              {isEditing ? (
                <div className="w-50 text-end">
                  <input
                    type="tel"
                    className={`form-control ${
                      errors.mobile ? "is-invalid" : ""
                    }`}
                    {...register("mobile", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit mobile number",
                      },
                    })}
                  />
                  {errors.mobile && (
                    <div className="text-danger small mt-1">
                      {errors.mobile.message}
                    </div>
                  )}
                </div>
              ) : (
                <span className="fw-semibold text-end">
                  {currentUser.mobile}
                </span>
              )}
            </div>

            {/* Password Row (Edit Mode Only)
            {isEditing && (
              <div className="d-flex justify-content-between align-items-center pt-2">
                <span className="text-muted">New Password</span>
                <input
                  type="password"
                  className="form-control w-50 text-end"
                  {...register("password", {
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                  placeholder="Leave blank to keep old"
                />
              </div>
            )} */}

            {/* Action Buttons */}
            {isEditing ? (
              <div className="d-flex justify-content-between gap-3 mt-5">
                <Button className="btn-primary-custom" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  variant="success"
                  className="btn-success-custom"
                  type="submit"
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="d-flex justify-content-between gap-3 mt-5">
                <Button className="btn-primary-custom" onClick={handleEditOpen}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="btn-danger-custom"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </form>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Profile;
