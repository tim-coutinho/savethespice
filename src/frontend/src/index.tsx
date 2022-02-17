import { render } from "react-dom";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";
import App from "./components/App";
import "./components/index.scss";
import { queryClient } from "./lib/hooks";

render(
  <RecoilRoot>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools position="bottom-right" />
      <App />
    </QueryClientProvider>
  </RecoilRoot>,
  document.querySelector("#root"),
);
