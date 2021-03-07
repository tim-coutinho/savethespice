import React from "react";
import { render } from "react-dom";

import { getById } from "./lib/common";
import App from "./components/App";
import "./components/index.scss";

const renderApp = () => render(<App />, getById("root"));

if (process.env.NODE_ENV !== "production" && module.hot) {
  module.hot.accept("./components/App", renderApp);
}

renderApp();
