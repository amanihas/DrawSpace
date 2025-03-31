import { useState } from 'react';
import './Register.css';


// missing password validation
// missing alert for successful registration
// Set formSubmitted will transition the page into thanks for registering, wait for an email and click the link to verify your account

export default function Register() {
  const [userInfo, setUserInfo] = useState({ userName: "", password: "", con_psw: "", email: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'  // Dev: Connect to local backend
    : ''; 

    e.preventDefault();
    if(userInfo.password !== userInfo.con_psw){
      alert("Passwords do not match");
      return;
    }
    setFormSubmitted(true);
    const timestamp = Math.floor(Date.now() / 1000);
    console.log("User Submission Request, Submitted at " + timestamp);
    const response = await fetch(`${API_URL}/HandleRegistration`, {
      method: 'POST',
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify(userInfo)
    });
    alert("Email sent to " + userInfo.email);
  };

  return (
    <div className="form-body">
      <div className="form-container">
        <h2>Start your Journey!</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">User Name:</label>
            <input
              type="text"
              onChange={(e) => setUserInfo({ ...userInfo, userName: e.target.value })}
              value={userInfo.userName}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
              value={userInfo.password}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              onChange={(e) => setUserInfo({ ...userInfo, con_psw: e.target.value })}
              value={userInfo.con_psw}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              value={userInfo.email}
            />
          </div>
          <div className="form-footer">
            <button type="submit">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}