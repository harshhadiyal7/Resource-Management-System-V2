import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // 1. Send POST request to your backend
      const res = await axios.post("http://localhost:5000/login", {
        email: email,
        password: password,
      });

      // 2. If successful, save token and redirect
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userRole", res.data.user.role);
        
        // Optional: specific check if you only want admins
        if(res.data.user.role !== 'admin') {
            setError("Access Denied: This portal is for Admins only.");
            return;
        }

        alert("Login Successful!");
        navigate("/admin-dashboard"); 
      }
      
    } catch (err) {
      // 3. Handle Errors
      if (err.response && err.response.data) {
        setError(err.response.data.message); 
      } else {
        setError("Something went wrong. Is the server running?");
      }
    }
  };

  return (
    <>
      {/* INTERNAL CSS STYLES - No separate file needed */}
      <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .login-page {
          height: 100vh;
          width: 100vw;
          background-color: #0B1120; /* Dark Navy Background */
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .login-card {
          background-color: #1E293B; /* Slate Blue Card */
          padding: 40px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          text-align: center;
          box-sizing: border-box;
        }
        .title {
          color: #ffffff;
          font-family: serif; 
          font-size: 24px;
          margin-bottom: 30px;
          font-weight: 600;
        }
        .input-group {
          margin-bottom: 20px;
        }
        .custom-input {
          width: 100%;
          padding: 12px 15px;
          background-color: #0F172A; /* Dark Input Bg */
          border: 1px solid #334155; /* Dark Border */
          border-radius: 6px;
          color: #E2E8F0; /* Light Text */
          font-size: 14px;
          outline: none;
          box-sizing: border-box; 
          transition: border-color 0.2s;
        }
        .custom-input::placeholder {
          color: #64748B;
        }
        .custom-input:focus {
          border-color: #3B82F6; /* Blue Focus Border */
        }
        .login-btn {
          width: 100%;
          padding: 12px;
          background-color: #2563EB; /* Bright Blue */
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 10px;
        }
        .login-btn:hover {
          background-color: #1D4ED8; /* Darker Blue Hover */
        }
        .error-msg {
          color: #F87171;
          background-color: rgba(220, 38, 38, 0.1);
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 13px;
          border: 1px solid rgba(220, 38, 38, 0.2);
        }
      `}</style>

      {/* COMPONENT UI */}
      <div className="login-page">
        <div className="login-card">
          <h2 className="title">Admin Portal</h2>
          
          {error && <div className="error-msg">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                className="custom-input"
                placeholder="Admin Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                className="custom-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">Log In as Admin</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;