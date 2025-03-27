import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";

// Initialize the Rough.js generator for drawing shapes
const generator = rough.generator();

// Function to create a new drawing element based on the selected tool type
const createElement = (id, x1, y1, x2, y2, type) => {
    switch (type) {
        case "line":
        case "rectangle":
            const roughElement =
                type === "line"
                    ? generator.line(x1, y1, x2, y2)
                    : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
            return { id, x1, y1, x2, y2, type, roughElement };
        case "pencil":
            return { id, type, points: [{ x: x1, y: y1 }] };
        case "text":
            return { id, type, x1, y1, x2, y2, text: "" };
        default:
            throw new Error(`Type not recognised: ${type}`);
    }
};

// Function to determine if a point is near a specific coordinate
const nearPoint = (x, y, x1, y1, name) => {
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

// Function to check if a point is on a line segment
const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < maxDistance ? "inside" : null;
};

// Determines the position of the cursor relative to an element (e.g., inside, on a border, etc.)
const positionWithinElement = (x, y, element) => {
    const { type, x1, x2, y1, y2 } = element;
    switch (type) {
        case "line":
            const on = onLine(x1, y1, x2, y2, x, y);
            const start = nearPoint(x, y, x1, y1, "start");
            const end = nearPoint(x, y, x2, y2, "end");
            return start || end || on;
        case "rectangle":
            const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
            return inside;
        case "pencil":
            const betweenAnyPoint = element.points.some((point, index) => {
                const nextPoint = element.points[index + 1];
                if (!nextPoint) return false;
                return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null;
            });
            return betweenAnyPoint ? "inside" : null;
        case "text":
            return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        default:
            throw new Error(`Type not recognised: ${type}`);
    }
};

// Calculates the distance between two points
const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

// Retrieves the element at a given position
const getElementAtPosition = (x, y, elements) => {
    return elements
        .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
        .find(element => element.position !== null);
};

// Adjusts element coordinates to ensure proper bounding box ordering
const adjustElementCoordinates = element => {
    const { type, x1, y1, x2, y2 } = element;
    if (type === "rectangle") {
        return {
            x1: Math.min(x1, x2),
            y1: Math.min(y1, y2),
            x2: Math.max(x1, x2),
            y2: Math.max(y1, y2)
        };
    } else {
        return x1 < x2 || (x1 === x2 && y1 < y2) ? { x1, y1, x2, y2 } : { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
};

// Custom hook to handle undo/redo functionality
const useHistory = initialState => {
    const [index, setIndex] = useState(0);
    const [history, setHistory] = useState([initialState]);

    const setState = (action, overwrite = false) => {
        const newState = typeof action === "function" ? action(history[index]) : action;
        if (overwrite) {
            const historyCopy = [...history];
            historyCopy[index] = newState;
            setHistory(historyCopy);
        } else {
            const updatedState = [...history].slice(0, index + 1);
            setHistory([...updatedState, newState]);
            setIndex(prevState => prevState + 1);
        }
    };

    const undo = () => index > 0 && setIndex(prevState => prevState - 1);
    const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);

    return [history[index], setState, undo, redo];
};

// Draws the element onto the canvas
const drawElement = (roughCanvas, context, element) => {
    switch (element.type) {
        case "line":
        case "rectangle":
            roughCanvas.draw(element.roughElement);
            break;
        case "pencil":
            const stroke = getSvgPathFromStroke(getStroke(element.points));
            context.fill(new Path2D(stroke));
            break;
        case "text":
            context.textBaseline = "top";
            context.font = "24px sans-serif";
            context.fillText(element.text, element.x1, element.y1);
            break;
        default:
            throw new Error(`Type not recognised: ${element.type}`);
    }
};

// Main application component
const App = () => {
    const [elements, setElements, undo, redo] = useHistory([]);
    const [action, setAction] = useState("none");
    const [tool, setTool] = useState("rectangle");
    const [selectedElement, setSelectedElement] = useState(null);

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        const roughCanvas = rough.canvas(canvas);
        context.clearRect(0, 0, canvas.width, canvas.height);
        elements.forEach(element => drawElement(roughCanvas, context, element));
    }, [elements]);

    return <canvas id="canvas" width={800} height={600} />;
};

export default App;
