import { render } from "react-dom";
import { RecoilRoot } from "recoil";
import App from "./components/App";
import "./components/index.scss";

import { getById } from "./lib/common";

render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  getById("root"),
);
