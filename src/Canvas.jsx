import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";
import html2canvas from "html2canvas";
import { nanoid } from "nanoid";
import Navbar from "./Navbar";
import "./Canvas.css";

// ---------------------------
// Custom useHistory hook for undo/redo
// ---------------------------
const useHistory = (initialState) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action, overwrite = false) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prev) => prev + 1);
    }
  };

  const undo = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  };

  const redo = () => {
    if (index < history.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  return [history[index], setState, undo, redo];
};

// ---------------------------
// Helper functions
// ---------------------------
const generator = rough.generator();

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

const nearPoint = (x, y, x1, y1, name) =>
  Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;

const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};

const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case "line":
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, "start");
      const end = nearPoint(x, y, x2, y2, "end");
      return start || end || on;
    case "rectangle":
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
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
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const getElementAtPosition = (x, y, elements) => {
  return elements
    .map((element) => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);
};

const adjustElementCoordinates = (element) => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

const cursorForPosition = (position) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null;
  }
};

const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
};

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

const adjustmentRequired = (type) => ["line", "rectangle"].includes(type);

const usePressedKeys = () => {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  useEffect(() => {
    const handleKeyDown = (event) => {
      setPressedKeys((prevKeys) => new Set(prevKeys).add(event.key));
    };
    const handleKeyUp = (event) => {
      setPressedKeys((prevKeys) => {
        const updatedKeys = new Set(prevKeys);
        updatedKeys.delete(event.key);
        return updatedKeys;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  return pressedKeys;
};

// ---------------------------
// Canvas Component
// ---------------------------
const Canvas = () => {
  const [elements, setElements, undo, redo] = useHistory([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("rectangle");
  const [selectedElement, setSelectedElement] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPanMousePosition, setStartPanMousePosition] = useState({ x: 0, y: 0 });
  const [imageName, setImageName] = useState("");
  const contentRef = useRef();
  const textAreaRef = useRef();
  const pressedKeys = usePressedKeys();
  const navigate = useNavigate();
  const location = useLocation();

  // If editing from gallery, load the background image
  useEffect(() => {
    if (location.state?.project) {
      const bgImage = new Image();
      bgImage.src = location.state.project.dataURL;
      bgImage.onload = () => {
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        context.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [location.state]);

  // ---------------------------
  // Updated getMouseCoordinates function
  // ---------------------------
  const getMouseCoordinates = (event) => {
    const canvas = document.getElementById("canvas");
    const { left, top } = canvas.getBoundingClientRect();
    // Adjust for the canvas's offset relative to the viewport and the pan offset.
    const clientX = event.clientX - left - panOffset.x;
    const clientY = event.clientY - top - panOffset.y;
    return { clientX, clientY };
  };

  // Draw canvas elements on layout changes
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (location.state?.project) {
      const bgImage = new Image();
      bgImage.src = location.state.project.dataURL;
      bgImage.onload = () => {
        context.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(panOffset.x, panOffset.y);
        elements.forEach((element) => {
          if (action === "writing" && selectedElement?.id === element.id) return;
          drawElement(roughCanvas, context, element);
        });
        context.restore();
      };
    } else {
      context.save();
      context.translate(panOffset.x, panOffset.y);
      elements.forEach((element) => {
        if (action === "writing" && selectedElement?.id === element.id) return;
        drawElement(roughCanvas, context, element);
      });
      context.restore();
    }
  }, [elements, action, selectedElement, panOffset, location.state]);

  // Undo/Redo keyboard handler
  useEffect(() => {
    const undoRedoFunction = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  // Panning using mouse wheel
  useEffect(() => {
    const panFunction = (event) => {
      setPanOffset((prevState) => ({
        x: prevState.x - event.deltaX,
        y: prevState.y - event.deltaY,
      }));
    };
    document.addEventListener("wheel", panFunction);
    return () => document.removeEventListener("wheel", panFunction);
  }, []);

  // Focus textarea when in writing mode
  useEffect(() => {
    if (action === "writing") {
      setTimeout(() => {
        textAreaRef.current.focus();
        textAreaRef.current.value = selectedElement?.text;
      }, 0);
    }
  }, [action, selectedElement]);

  const updateElement = (id, x1, y1, x2, y2, type, options = {}) => {
    const elementsCopy = [...elements];
    switch (type) {
      case "line":
      case "rectangle":
        elementsCopy[id] = createElement(id, x1, y1, x2, y2, type);
        break;
      case "pencil":
        elementsCopy[id].points = [
          ...elementsCopy[id].points,
          { x: x2, y: y2 },
        ];
        break;
      case "text":
        const textWidth = document
          .getElementById("canvas")
          .getContext("2d")
          .measureText(options.text).width;
        const textHeight = 24;
        elementsCopy[id] = {
          ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type),
          text: options.text,
        };
        break;
      default:
        throw new Error(`Type not recognised: ${type}`);
    }
    setElements(elementsCopy, true);
  };

  const handleMouseDown = (event) => {
    if (action === "writing") return;
    const { clientX, clientY } = getMouseCoordinates(event);

    // Check for middle-mouse button or space key for panning
    if (event.button === 1 || pressedKeys.has(" ")) {
      setAction("panning");
      setStartPanMousePosition({ x: clientX, y: clientY });
      return;
    }

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        if (element.type === "pencil") {
          const xOffsets = element.points.map((point) => clientX - point.x);
          const yOffsets = element.points.map((point) => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements((prev) => prev);
        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, tool);
      setElements((prev) => [...prev, element]);
      setSelectedElement(element);
      setAction(tool === "text" ? "writing" : "drawing");
    }
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    if (action === "panning") {
      const deltaX = clientX - startPanMousePosition.x;
      const deltaY = clientY - startPanMousePosition.y;
      setPanOffset({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY,
      });
      return;
    }

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      event.target.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;
        const options = type === "text" ? { text: selectedElement.text } : {};
        updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, options);
      }
    } else if (action === "resizing") {
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(clientX, clientY, position, coordinates);
      updateElement(id, x1, y1, x2, y2, type);
    }
  };

  const handleMouseUp = (event) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    if (selectedElement) {
      if (
        selectedElement.type === "text" &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1
      ) {
        setAction("writing");
        return;
      }
      const index = selectedElement.id;
      const { id, type } = elements[index];
      if (
        (action === "drawing" || action === "resizing") &&
        ["line", "rectangle"].includes(type)
      ) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }
    }
    if (action !== "writing") {
      setAction("none");
      setSelectedElement(null);
    }
  };

  const handleBlur = (event) => {
    const { id, x1, y1, type } = selectedElement;
    setAction("none");
    setSelectedElement(null);
    updateElement(id, x1, y1, null, null, type, { text: event.target.value });
  };

  const uploadImageToGallery = async () => {
    if (!contentRef.current || !imageName) {
      alert("Enter a valid image name");
      return;
    }
    const canvasElement = await html2canvas(contentRef.current);
    const image = canvasElement.toDataURL("image/png", 1.0);
    const storedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    const newProject = { id: nanoid(), title: imageName, dataURL: image };
    const updatedGallery = [...storedImages, newProject];
    localStorage.setItem("galleryImages", JSON.stringify(updatedGallery));
    alert("Image saved to gallery!");
    
    // Navigate to Gallery page after saving
    navigate("/gallery");
  };

  const DownloadImage = () => {
    html2canvas(contentRef.current)
      .then((canvas) => {
        let image = canvas.toDataURL("image/png", 1.0);
        const a = document.createElement("a");
        a.href = image;
        a.download = imageName + ".png";
        a.click();
      })
      .catch((err) => {
        console.error("Screenshot Failed", err);
      });
  };

  const handleNameChange = (e) => {
    setImageName(e.target.value);
  };

  return (
    <div className="canvas-page">
      <Navbar />
      <div className="canvas-container">
        <div className="canvas-wrapper" ref={contentRef}>
          <canvas
            id="canvas"
            width={window.innerWidth - 250}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          {action === "writing" && (
            <textarea
              ref={textAreaRef}
              onBlur={handleBlur}
              style={{
                position: "absolute",
                top: selectedElement.y1 - 2 + panOffset.y,
                left: selectedElement.x1 + panOffset.x,
              }}
              className="canvas-textarea"
            />
          )}
        </div>
        <div className="toolbox">
          <h3>Toolbox</h3>
          <div className="toolbox-group">
            <label>
              <input
                type="radio"
                checked={tool === "selection"}
                onChange={() => setTool("selection")}
              />
              Selection
            </label>
            <label>
              <input
                type="radio"
                checked={tool === "line"}
                onChange={() => setTool("line")}
              />
              Line
            </label>
            <label>
              <input
                type="radio"
                checked={tool === "rectangle"}
                onChange={() => setTool("rectangle")}
              />
              Rectangle
            </label>
            <label>
              <input
                type="radio"
                checked={tool === "pencil"}
                onChange={() => setTool("pencil")}
              />
              Pencil
            </label>
            <label>
              <input
                type="radio"
                checked={tool === "text"}
                onChange={() => setTool("text")}
              />
              Text
            </label>
          </div>
          <div className="toolbox-group">
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
          </div>
          <div className="toolbox-group">
            <input
              type="text"
              placeholder="Image Name"
              value={imageName}
              onChange={handleNameChange}
            />
            <button onClick={uploadImageToGallery}>Save to Gallery</button>
            <button onClick={DownloadImage}>Download Image</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
