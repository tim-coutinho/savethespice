import { StrictMode } from "react";
import { render } from "react-dom";

import { AppProvider } from "@/providers";
import { AppRoutes } from "@/routes";
import "./components/index.scss";

render(
  <StrictMode>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </StrictMode>,
  document.querySelector("#root"),
);
