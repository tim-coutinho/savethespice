import React from "react";
import ContentLoader from "react-content-loader";

import { colors } from "../utils/common";

export default function RecipeLoader() {
  return (
    <div className="recipe-wrapper">
      <div className="recipe loading">
        <ContentLoader
          speed={1}
          width={263}
          height={95}
          viewBox="0 0 263 95"
          backgroundColor={colors.WHITE}
          foregroundColor={colors.OD_WHITE}
        >
          <rect x="143" y="20" rx="0" ry="0" width="119" height="120" />
          <rect x="0" y="65" rx="2" ry="2" width="70" height="6" />
          <rect x="0" y="50" rx="2" ry="2" width="100" height="10" />
        </ContentLoader>
      </div>
    </div>
  );
}
