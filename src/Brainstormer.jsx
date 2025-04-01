// BrainStormer
// Add Links to Canvas and back to the User Dashboard
// Currently Checks if User has a token, if not, redirects to Sign In

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import "./Brainstormer.css";

export default function Brainstormer() {
    const [notes, setNotes] = useState([]);
    const [user, setUser] = useState({});
    const [selectedColor, setSelectedColor] = useState("yellow"); // Default color
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const API_URL = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000'  // Dev: Connect to local backend
            : ''; 
    
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

    const goToDashboard = () => {
        navigate("/user-dashboard");
    };

    const addNote = () => {
        const newNote = {
            id: uuidv4(),
            text: "New Note",
            color: selectedColor,
            x: 100,
            y: 100,
            width: 200,
            height: 150,
        };
        setNotes([...notes, newNote]);
    };

    const updateNote = (id, newProps) => {
        setNotes(notes.map(note => (note.id === id ? { ...note, ...newProps } : note)));
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    return (
        <div className="relative w-full h-screen bg-gray-100 p-4">
            {/* Header Section */}
            <div className="header">
                <h1>Brainstormer</h1>
                <button className="dashboard-button" onClick={goToDashboard}>
                    Go to Dashboard
                </button>
            </div>

            {/* Controls Section */}
            <div className="controls">
                <button className="add-note-button" onClick={addNote}>
                    Add Note
                </button>
                <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                >
                    <option value="yellow">Yellow</option>
                    <option value="lightblue">Light Blue</option>
                    <option value="pink">Pink</option>
                    <option value="lightgreen">Light Green</option>
                    <option value="lavender">Lavender</option>
                </select>
            </div>

            {/* Sticky Notes */}
            {notes.map((note) => (
                <Rnd
                    key={note.id}
                    default={{ x: note.x, y: note.y, width: note.width, height: note.height }}
                    onDragStop={(e, d) => updateNote(note.id, { x: d.x, y: d.y })}
                    onResizeStop={(e, direction, ref, delta, position) =>
                        updateNote(note.id, { width: ref.offsetWidth, height: ref.offsetHeight, ...position })
                    }
                    className="sticky-note"
                    style={{ backgroundColor: note.color }}
                >
                    <textarea
                        className="w-full h-full bg-transparent resize-none p-2 focus:outline-none"
                        value={note.text}
                        onChange={(e) => updateNote(note.id, { text: e.target.value })}
                    />
                    <button
                        className="absolute top-0 right-0 p-1 text-xs text-red-500"
                        onClick={() => deleteNote(note.id)}
                    >
                        ✕
                    </button>
                </Rnd>
            ))}
        </div>
    );
}