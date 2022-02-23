import { render } from "react-dom";

import { AppProvider } from "@/providers";
import { AppRoutes } from "@/routes";
import "./components/index.scss";

render(
  <AppProvider>
    <AppRoutes />
  </AppProvider>,
  document.querySelector("#root"),
);
