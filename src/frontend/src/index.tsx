import { render } from "react-dom";

import { AppProvider } from "@/providers";

import App from "./App";
import "./components/index.scss";

render(
  <AppProvider>
    <App />
  </AppProvider>,
  document.querySelector("#root"),
);
