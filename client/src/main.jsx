import React from "react";
import { createRoot } from "react-dom/client";
import AppWithQuery from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWithQuery />
  </React.StrictMode>
);
