import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { getById } from "./utils/common";
import App from "./components/App";
import configureStore from "./configureStore";
import "./components/index.scss";

const store = configureStore();

const renderApp = () =>
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    getById("root")
  );

if (process.env.NODE_ENV !== "production" && module.hot) {
  module.hot.accept("./components/App", renderApp);
}

renderApp();
