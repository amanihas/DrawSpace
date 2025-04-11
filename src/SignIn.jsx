import { useState } from 'react';
import './Form.css';
import { data, useNavigate } from 'react-router-dom';
import Nav from './Nav';
export default function SignIn() {


  const [userInfo, setUserInfo] = useState({ userName: "", password: "" });
  const [resData, setResData] = useState("");
  const [jwtToken, setJwtToken] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add sign-in functionality here
    // add a try catch for user sign in request
    // sign-in should return a message for the following
    // 1. Sign In Successful
    // 2. Sign In Failed : User not found
    // 3. Sign In Failed : Password Incorrect
    // 4. Sign In Failed : User not Verified
    // message will be appended to the component, via resData use json for temporary alert

    const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'  // Dev: Connect to local backend
    : ''; 

    const timestamp = Math.floor(Date.now() / 1000);
    console.log("User Sign In Request, Submitted at " + timestamp);
    try{
        const response = await fetch(`${API_URL}/HandleSignIn`,{
        method: 'POST',
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify(userInfo)
      });
      const data =  await response.json();
      setResData(data.message);
      localStorage.setItem('token', data.token);
      navigate("/user-dashboard")
      console.log(localStorage.getItem('token')); // REMOVE THIS later!
      alert(data.message);
    }
    catch(error){
    setResData(data.message);
    alert(setResData);
  }
    


  };

  return (
    <div className="form-body">
      <Nav />
      <div className="form-container">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Username:</label>
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
          <div className="form-footer">
            <button type="submit">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  );
}