import { useForm, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../store/AuthContextProvider"; // Import the custom hook
import type { LoginType } from "../../types/AuthContextType";
import toast from "react-hot-toast";

function Login() {

  const navigate=useNavigate();
  const {  isLoading, userLogin, currentUser,loginError}=useAuth(); // Using the custom hook to access context functions
  // intializing react-hook-form
  const {
    register,
    handleSubmit,
    formState:{errors},
  }=useForm<LoginType>();


  // Handle form submission
  const onFormSubmit: SubmitHandler<LoginType>=async(data)=>{
    try {
       userLogin(data);
    } catch (err) {
      toast.error("Server Error");
    }
  };

  useEffect(()=> {
    if (currentUser && currentUser.role==="user") {
      navigate("/user");  // Navigate after a successful login
    }
    if(currentUser && currentUser.role==="admin"){
      navigate("/admin")
    }
  },[currentUser,navigate]);

  return (
    <div>
      <h3 className="text-center mb-2 mt-4">OLMS</h3>
      <div className="container d-flex justify-content-center align-items-center">
        <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
          <h3 className="text-left mb-3">Login</h3>

          {/* display error message */}
          {/* {isLoading && <p className="text-info text-center">Logging in...</p>} */}
          {loginError!==null && <p className="text-center text-danger">{loginError}</p>}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onFormSubmit)}>
            {/* Username Field */}
            <div className="form-floating mb-3">
              <input
                type="text"
                id="username"
                className="form-control form-control-sm"
                placeholder="Username"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 4,
                    message: "Username must be at least 4 characters",
                  },
                })}
              />
              <label htmlFor="username">Username</label>
              {/* error message */}
              {errors.username && <p className="text-danger mt-1">{errors.username.message}</p>}
            </div>

            {/* Password Field */}
            <div className="form-floating mb-3">
              <input
                type="password"
                id="password"
                className="form-control form-control-sm"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 4,
                    message: "Password should contain min 4 characters",
                  },
                })}
              />
              <label htmlFor="password">Password</label>
              {errors.password && <p className="text-danger mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn btn-dark text-white" disabled={isLoading}>
                {isLoading===true ? "Submitting..." : "Submit"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
