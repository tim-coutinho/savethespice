import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { addBabelPlugin, addWebpackPlugin, override } from "customize-cra";

const isDevelopment = process.env.NODE_ENV === "development";

module.exports = override(
  isDevelopment && addBabelPlugin(require.resolve("react-refresh/babel")),
  isDevelopment && addWebpackPlugin(new ReactRefreshPlugin()),
);

export {};
