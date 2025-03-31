import {useEffect, useState} from "react"
import {useParams} from "react-router-dom"
// cleanToken is a temp fix, tokens have a quotation mark afterwards for some reason..


export default function Verification(){
    const {token} = useParams()
    const [message,setMessage] = useState("Loading Verification...")
    const cleanedToken = token?.replace(/^"|"$/g, "");

    console.log("Token from URL:", token); 

    useEffect(() => {

        const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000'  // Dev: Connect to local backend
        : ''; 
    
        const verifyUser = async () => {
            try {
                const response = await fetch(`${API_URL}verifyUser/${cleanedToken}`, {
                    method: "GET",
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message); // "User Verified!"
                } else {
                    setMessage(data.message || "Verification failed.");
                }
            } catch (error) {
                setMessage("Server error. Please try again.");
            }
        };

        verifyUser();
    }, [token]);



    return(
        <h1> {message} </h1>
    )


}