import { useForm, type SubmitHandler } from 'react-hook-form';
import type { UserType } from '../../types/UserType';
import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate for redirection
import { useState } from 'react';
import { RegisterApi } from '../../services/user/RegisterApi';


function Register() {

  const {registerApi}=RegisterApi()
  const navigate=useNavigate();
  const {
    register,
    handleSubmit,
    formState:{ errors }
  } = useForm<UserType>();

  // manage UI state locally
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // state to track success or failure

  // submit handler
  const onSubmit: SubmitHandler<UserType>=async(data) => {
    setIsLoading(true);
    setStatus('');
     setIsSuccess(null);
     const userDataWithRole={
      ...data,
      role:'user',
      cart:[],
      borrowed_books:[],
      fine:0
    };
    // try {
    //   await registerUser(userDataWithRole);
    //   setStatus("Successfully registered.");
    //   if(registerStatus){
    //     setIsSuccess(true);
    //   }
    //   else{
    //     setIsSuccess(false)
    //   }
    //   setTimeout(()=>navigate("/login"),2000)
    // } catch (error: any) {
    //   setStatus(`Registration failed: ${error.message}`);
    // } finally {
    //   setIsLoading(false);
    // }
   const regiStatus= await registerApi(userDataWithRole)
   if(regiStatus.status===201){
      setStatus(regiStatus.data.message)
      setIsSuccess(true)
      setTimeout(()=>navigate("/login"),2000)
   }
   else{
    setStatus(regiStatus.data.message)
   }
   setIsLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-item-center mt-5 ">
      <form className="w-100 p-4 bg-white rounded shadow" style={{ maxWidth: '400px' }} onSubmit={handleSubmit(onSubmit)}>
        <h4 className="text-center mt-2 mb-2">OLMS Registration</h4>

        { status && (
          <p style={{ color:isSuccess?'green':'red',}}>
            {status}
          </p>
        )}

        {/* username */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Enter Username"
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 4,
                message: 'Username must be at least 4 characters'
              }
            })}
          />
          <div className="invalid-feedback">{errors.username?.message}</div>
        </div>

        {/* Mobile Number */}
        <div className="col mb-3">
          <input
            type="tel"
            placeholder="Mobile Number"
            className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
            {...register('mobile', {
              required: 'Mobile number is required',
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: 'Enter a valid 10-digit mobile number'
              }
            })}
          />
          <div className="invalid-feedback">{errors.mobile?.message}</div>
        </div>
        
        {/* Email */}
        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Please enter a valid email address'
              }
            })}
          />
          <div className="invalid-feedback">{errors.email?.message}</div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <input
            type="password"
            placeholder="Password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            {...register('password', {
              required: 'Password is required',
              // pattern: {
              //   value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/,
              //   message: 'Password must start with a capital letter, include a number and special character'
              // }
            })}
          />
          <div className="invalid-feedback">{errors.password?.message}</div>
        </div>
        
        {/* submit */}
        <button type="submit" className="btn btn-dark text-white w-100" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        <div>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Register;
