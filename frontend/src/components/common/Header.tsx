// import "../../css/Header.css";
// import { BiSearch } from "react-icons/bi";
// import { FaBook } from "react-icons/fa";
// import { NavLink, useNavigate } from "react-router";
// import { useAuth } from "../../store/AuthContextProvider";
// import { useState } from "react";
// import { Button, Offcanvas } from "react-bootstrap";
// import type { UserType } from "../../types/UserType";
// import { CgProfile } from "react-icons/cg";
// import { SlBasketLoaded } from "react-icons/sl";
// import { SiBookstack } from "react-icons/si";
// import { useSearchTermContext } from "../../store/SearchContext";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
 
// type ProfileFormData = {
//   username: string;
//   email: string;
//   mobile: string;
//   password?: string;
// };
 
// function Header() {
//   const [showCanvas, setShowCanvas] = useState<boolean>(false);
//   const [isEditing, setIsEditing] = useState(false);
 
//   const { searchTerm, setSearchTerm } = useSearchTermContext();
//   const { currentUser, updateUser, userLogout } = useAuth();
//   const navigate = useNavigate();
 
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<ProfileFormData>({
//     defaultValues: {
//       username: currentUser?.username || "",
//       email: currentUser?.email || "",
//       mobile: currentUser?.mobile || "",
//       password: "",
//     },
//   });
 
//   const handleOpen = () => {
//     setShowCanvas(true);
//     reset({
//       username: currentUser?.username || "",
//       email: currentUser?.email || "",
//       mobile: currentUser?.mobile || "",
//       password: "",
//     });
//   };
 
//   const handleClose = () => {
//     setShowCanvas(false);
//     setIsEditing(false);
//     reset();
//   };
 
//   const handleEditOpen = () => {
//     setIsEditing(true);
//   };
 
//   const onSubmit = (data: ProfileFormData) => {
//     if (!currentUser) return;
//     const updatedUser: UserType = {
//       ...currentUser,
//       ...data,
//       role: currentUser.role ?? "user",
//     };
//     updateUser(updatedUser);
//     setIsEditing(false);
//     setShowCanvas(false);
//     toast.success("Profile updated successfully!");
//   };
 
//   const handleLogout = () => {
//     userLogout();
//     navigate("/");
//   };
 
//   return (
//     <div className="navigation shadow-sm">
//       <nav
//         className={`navbar navbar-expand-sm navbar-light bg-light ps-2 ${
//           currentUser?.role === "user" ? "p-1" : "p-4"
//         }`}>
//         <div className="container-fluid">
//           <NavLink to="books" className="no-link-style d-flex align-items-center ms-5">
//             <FaBook size={30} className="text-dark me-2" />
//             <span className="fs-4 fw-bold">OLMS</span>
//           </NavLink>
 
//           <div className="input-group ms-auto" style={{ maxWidth: "28rem" }}>
//             <span className="input-group">
//               <span className="input-group-text bg-white border-end-0">
//                 <BiSearch />
//               </span>
//               <input
//                 type="text"
//                 id="search"
//                 value={searchTerm}
//                 className="form-control border border-start-0 rounded-end-3"
//                 placeholder="Search by Bookname, author, title..."
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </span>
//           </div>
 
//           {currentUser ? (
//             currentUser.role === "user" ? (
//               <div className="d-flex gap-4 align-items-center mx-auto p-4">
//                 <NavLink className="nav-link" to="dashboard">
//                   Dashboard
//                 </NavLink>
//                 <NavLink className="nav-link" to="/user/my-books">
//                   My Books <SiBookstack className="fs-5" />
//                 </NavLink>
//                 <NavLink className="nav-link" to="cart">
//                   Cart <SlBasketLoaded className="fs-5" />
//                 </NavLink>
//                 <NavLink className="nav-link me-3" to="" onClick={handleOpen}>
//                   <CgProfile className="text-bold d-block fs-3 ms-3" />
//                   {/* <span className="text-capitalize d-none d-lg-inline text-glow">
//                     hi, {currentUser.username}👋🏻
//                   </span> */}
//                 </NavLink>
//               </div>
//             ) : (
//               <div className="d-flex align-items-center gap-4 mx-auto">
//                 <NavLink className="nav-link" to="dashboard">
//                   Dashboard
//                 </NavLink>
//                 <NavLink className="nav-link" to="members">
//                   Members
//                 </NavLink>
//                 <NavLink className="nav-link" to="booklist">
//                   Books
//                 </NavLink>
//                 <NavLink className="nav-link" to="" onClick={handleOpen}>
//                   Profile
//                 </NavLink>
//               </div>
//             )
//           ) : (
//             <div className="d-flex gap-2">
//               <NavLink to="login">
//                 <button className="btn btn-light">Login</button>
//               </NavLink>
//               <NavLink to="register">
//                 <button className="btn btn-dark text-white">SignUp</button>
//               </NavLink>
//             </div>
//           )}
//         </div>
//       </nav>
 
   
//      {/* Profile Offcanvas */}
//       <Offcanvas
//         show={showCanvas}
//         onHide={handleClose}
//         placement="end"
//         className="profile-offcanvas" // Apply custom class for max-width
//       >
//         <Offcanvas.Header closeButton className="bg-light" />
//         <Offcanvas.Body className="bg-light">
//           <div
//             className="p-4 bg-white mx-auto profile-card-container" // Inline styles replaced by profile-card-container
//           >
//             {/* Avatar and Role */}
//             <div className="text-center mb-4">
//               <div
//                 className="rounded-circle d-inline-flex justify-content-center align-items-center mt-3 profile-avatar-circle" // Inline styles replaced by profile-avatar-circle
//               >
//                 <span className="profile-avatar-initial">
//                   {currentUser?.username?.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//               <h5 className="mt-2 mb-1 fw-bold text-capitalize">{currentUser?.username}</h5>
//               <span className="badge bg-success text-uppercase">{currentUser?.role}</span>
//             </div>
 
//             {/* Profile Form */}
//             <form onSubmit={handleSubmit(onSubmit)}>
//               {/* Username */}
//               <div className="d-flex justify-content-between align-items-center py-2">
//                 <span className="text-muted">Username</span>
//                 {isEditing ? (
//                   <div className="w-50 text-end">
//                     <input
//                       type="text"
//                       className={`form-control ${errors.username ? "is-invalid" : ""}`}
//                       {...register("username", {
//                         required: "Username is required",
//                         minLength: { value: 3, message: "Minimum 3 characters" },
//                         pattern: {
//                           value: /^[a-zA-Z0-9_]+$/,
//                           message: "Only letters, numbers, and underscores allowed",
//                         },
//                       })}
//                     />
//                     {errors.username && (
//                       <div className="text-danger small mt-1">{errors.username.message}</div>
//                     )}
//                   </div>
//                 ) : (
//                   <span className="fw-semibold text-end">{currentUser?.username}</span>
//                 )}
//               </div>
 
//               {/* Email */}
//               <div className="d-flex justify-content-between align-items-center py-2">
//                 <span className="text-muted">Email</span>
//                 {isEditing ? (
//                   <div className="w-50 text-end">
//                     <input
//                       type="email"
//                       className={`form-control ${errors.email ? "is-invalid" : ""}`}
//                       {...register("email", {
//                         required: "Email is required",
//                         pattern: {
//                           value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                           message: "Invalid email format",
//                         },
//                       })}
//                     />
//                     {errors.email && (
//                       <div className="text-danger small mt-1">{errors.email.message}</div>
//                     )}
//                   </div>
//                 ) : (
//                   <span className="fw-semibold text-end">{currentUser?.email}</span>
//                 )}
//               </div>
 
//               {/* Mobile */}
//               <div className="d-flex justify-content-between align-items-center py-2">
//                 <span className="text-muted">Mobile</span>
//                 {isEditing ? (
//                   <div className="w-50 text-end">
//                     <input
//                       type="tel"
//                       className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
//                       {...register("mobile", {
//                         required: "Mobile number is required",
//                         pattern: {
//                           value: /^[6-9]\d{9}$/,
//                           message: "Enter a valid 10-digit  mobile number",
//                         },
//                       })}
//                     />
//                     {errors.mobile && (
//                       <div className="text-danger small mt-1">{errors.mobile.message}</div>
//                     )}
//                   </div>
//                 ) : (
//                   <span className="fw-semibold text-end">{currentUser?.mobile}</span>
//                 )}
//               </div>
 
//               {/* Password Row (Edit Mode Only) */}
//               {isEditing && (
//                 <div className="d-flex justify-content-between align-items-center pt-2">
//                   <span className="text-muted">Password</span>
//                   <input
//                     type="password"
//                     className="form-control w-50 text-end"
//                     {...register("password", { required: "Password is required" })}
//                     placeholder="New password"
//                   />
//                 </div>
//               )}
 
//               {/* Action Buttons */}
//               {isEditing ? (
//                 <div className="d-flex justify-content-between gap-3 mt-5">
//                   <Button
//                     className="btn-primary-custom" // Custom class for style
//                     onClick={() => {
//                       setIsEditing(false);
//                       reset();
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button variant="success" className="btn-success-custom" type="submit">
//                     Save
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="d-flex justify-content-between gap-3 mt-5">
//                   <Button
//                     className="btn-primary-custom" // Custom class for style
//                     onClick={handleEditOpen}
//                   >
//                     Edit
//                   </Button>
//                   <Button
//                     variant="danger"
//                     className="btn-danger-custom" // Custom class for style
//                     onClick={handleLogout}
//                   >
//                     Logout
//                   </Button>
//                 </div>
//               )}
//             </form>
//           </div>
//         </Offcanvas.Body>
//       </Offcanvas>
//     </div>
//   );
// }
 
// export default Header;

import "../../css/Header.css";
import { useState } from "react";
import Navbar from "./Navbar"; // Import the new Navbar component
import Profile from "./Profile"; // Import the new Profile component

function Header() {
  const [showCanvas, setShowCanvas]=useState<boolean>(false);

  //function to open the Offcanvas
  const handleOpen=()=>setShowCanvas(true);


  // function to close the Offcanvas
  const handleClose=()=>setShowCanvas(false);


  return (
    <div className="navigation shadow-sm">
      <Navbar handleOpenProfile={handleOpen} />

      {/* Profile Offcanvas */}
      <Profile showCanvas={showCanvas} handleClose={handleClose} />
    </div>
  );
}

export default Header;
