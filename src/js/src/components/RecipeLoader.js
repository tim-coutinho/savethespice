import React from "react";
import ContentLoader from "react-content-loader";

import colors from "../utils/colors";

export default function RecipeLoader() {
  return (
    <div className={"recipe-wrapper"}>
      <div className="recipe loading">
        <ContentLoader
          speed={1}
          width={263}
          height={77}
          viewBox="0 0 263 77"
          backgroundColor={colors.WHITE}
          foregroundColor={colors.OD_WHITE}
        >
          <rect x="143" y="0" rx="0" ry="0" width="120" height="85" />
          <rect x="0" y="35" rx="2" ry="2" width="70" height="6" />
          <rect x="0" y="20" rx="2" ry="2" width="100" height="10" />
        </ContentLoader>
      </div>
    </div>
  );
}
