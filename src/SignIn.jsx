import { useState } from 'react';
import './Register.css';
export default function SignIn() {
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add sign-in functionality here
  };

  return (
    <div className="form-body">
      <div className="form-container">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              value={userInfo.email}
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