import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReaderStudy from "./pages/ReaderStudy.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReaderStudy />
  </StrictMode>,
);
