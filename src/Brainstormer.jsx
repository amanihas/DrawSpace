import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";
import Button from './ui/Stickybutton';
import { useNavigate } from "react-router-dom";
import "./Brainstormer.css";
import Navbar from "./Navbar";

export default function Brainstormer() {
    const [notes, setNotes] = useState(() => {
        const savedNotes = localStorage.getItem("brainstormerNotes");
        return savedNotes ? JSON.parse(savedNotes) : [];
    });
    const [selectedColor, setSelectedColor] = useState("yellow");
    const navigate = useNavigate();

    // Add missing function definitions
    const updateNote = (id, newProps) => {
        setNotes(notes.map(note => 
            note.id === id ? { ...note, ...newProps } : note
        ));
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    const addNote = () => {
        const newNote = {
            id: uuidv4(),
            text: "",
            color: selectedColor,
            x: Math.random() * window.innerWidth * 0.5,
            y: Math.random() * window.innerHeight * 0.5,
            width: 200,
            height: 150,
        };
        setNotes([...notes, newNote]);
    };

    useEffect(() => {
        localStorage.setItem("brainstormerNotes", JSON.stringify(notes));
    }, [notes]);

    // Rest of the component...

    return (
        <div className="brainstormer-container">
            <Navbar />
            <div className="brainstormer-header">
                <h1>Brainstormer</h1>
                <div className="controls-container">
                    <Button onClick={addNote} className="control-button">
                        + Add Note
                    </Button>
                    
                    <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="color-picker"
                    >
                        <option value="#ffeb3b">Yellow</option>
                        <option value="#90caf9">Light Blue</option>
                        <option value="#f48fb1">Pink</option>
                        <option value="#a5d6a7">Mint</option>
                        <option value="#e1bee7">Lavender</option>
                    </select>
                </div>
            </div>

            <div className="notes-container">
                {notes.map((note) => (  // Make sure this is 'note'
                    <Rnd
                        key={note.id}
                        default={{
                            x: note.x,
                            y: note.y,
                            width: note.width,
                            height: note.height
                        }}
                        bounds="parent"
                        onDragStop={(e, d) => updateNote(note.id, { x: d.x, y: d.y })}
                        onResizeStop={(e, direction, ref, delta, position) => {
                            updateNote(note.id, {
                                width: ref.offsetWidth,
                                height: ref.offsetHeight,
                                ...position
                            });
                        }}
                        className="sticky-note"
                        style={{ backgroundColor: note.color }}
                    >
                        <textarea
                            className="note-content"
                            value={note.text}
                            onChange={(e) => updateNote(note.id, { text: e.target.value })}
                            placeholder="New Note"
                            onFocus={(e) => {
                                if (note.text === "") {
                                    e.target.placeholder = "";
                                }
                            }}
                            onBlur={(e) => {
                                if (note.text === "") {
                                    e.target.placeholder = "New Note";
                                }
                            }}
                        />
                        <button
                            className="delete-note"
                            onClick={() => {
                                if(window.confirm("Delete this note permanently?")) {
                                    deleteNote(note.id);
                                }
                            }}
                        >
                            ×
                        </button>
                    </Rnd>
                ))}
            </div>
        </div>
    );
}