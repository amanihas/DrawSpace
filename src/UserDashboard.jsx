import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function UserDashboard() {
    const [user, setUser] = useState({}); 
    const navigate = useNavigate();

    // Checks if the user has a token, if not, redirects to Sign In
    

    useEffect(() => {
        const token = localStorage.getItem("token");
    
        if (!token) {
            alert("Unauthorized access. Please log in.");
            navigate("/signin");
        } else {
            fetch("http://localhost:5000/user-data", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.status < 200 || res.status >= 300) {  // Check for a successful status code range
                    localStorage.removeItem("token");
                    alert("Session expired or unauthorized. Redirecting to Home.");
                    navigate("/");  // Redirect to Home
                    return;
                }
                return res.json();  // Proceed if status is in the 200-299 range
            })
            .then((data) => {
                if (data) {
                    setUser(data); // Set the user data to the state
                }
            })
            .catch(() => {
                alert("Error fetching user data.");
                localStorage.removeItem("token");
                navigate("/");  // Redirect to Home on error
            });
        }
    }, [navigate]);

    const goToBrainstormer = () => {
        navigate("/brainstormer");  // Navigate to Brainstormer page
    };
    const gotoCanvas = () => {
        navigate("/canvas");        // Navigate to Canvas page
    }



    return (
        <div>
            <h1>User Dashboard</h1>
            <p>Welcome to your dashboard {user.userName}</p>
            <button onClick={goToBrainstormer}>Go to Brainstormer</button>
            <button onClick={gotoCanvas}>Go to Canvas</button>
        </div>
    )
}