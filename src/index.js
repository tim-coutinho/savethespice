import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { getById } from "./utils/common";
import App from "./components/App";
import "./components/index.scss";

render(<App />, getById("root"));
