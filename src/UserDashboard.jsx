import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

export default function UserDashboard() {
    const [user, setUser] = useState({}); 
    const navigate = useNavigate();

    const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'  // Dev: Connect to local backend
    : ''; 

    useEffect(() => {
        const token = localStorage.getItem("token");
    
        if (!token) {
            alert("Unauthorized access. Please log in.");
            navigate("/signin");
        } else {
            fetch(`${API_URL}/user-data`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.status < 200 || res.status >= 300) {
                    localStorage.removeItem("token");
                    alert("Session expired or unauthorized. Redirecting to Home.");
                    navigate("/");
                    return;
                }
                return res.json();
            })
            .then((data) => {
                if (data) {
                    setUser(data);
                }
            })
            .catch(() => {
                alert("Error fetching user data.");
                localStorage.removeItem("token");
                navigate("/");
            });
        }
    }, [navigate]);

    const goToBrainstormer = () => {
        navigate("/brainstormer");
    };
    const gotoCanvas = () => {
        navigate("/canvas");
    };

    return (
        <div className="dashboard-container">
            <h1>User Dashboard</h1>
            <p>Welcome to your dashboard, {user.userName}</p>
            <div className="dashboard-buttons">
                <button onClick={goToBrainstormer}>Go to Brainstormer</button>
                <button onClick={gotoCanvas}>Go to Canvas</button>
            </div>
        </div>
    );
}