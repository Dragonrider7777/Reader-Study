import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import TestInterface from "./TestInterface.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TestInterface />
  </StrictMode>,
);
