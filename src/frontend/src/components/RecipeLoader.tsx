import { useMantineColorScheme } from "@mantine/core";
import { ReactElement } from "react";
// import Skeleton from "react-loading-skeleton";
import ContentLoader from "react-content-loader";

import { Color } from "../lib/common";

export default (): ReactElement => {
  const { colorScheme: theme } = useMantineColorScheme();

  return (
    <div className="recipe-wrapper">
      <div className="recipe loading">
        {/*<Skeleton*/}
        {/*  baseColor={Color.OD_PURPLE}*/}
        {/*  highlightColor={Color.OD_WHITE}*/}
        {/*  height={100}*/}
        {/*  width="100%"*/}
        {/*/>*/}
        <ContentLoader
          speed={1}
          width={263}
          height={95}
          viewBox="0 0 263 95"
          backgroundColor={theme === "dark" ? Color.WHITE : Color.OD_WHITE}
          foregroundColor={theme === "dark" ? Color.OD_WHITE : Color.WHITE}
        >
          <rect x="143" y="20" rx="0" ry="0" width="119" height="120" />
          <rect x="0" y="65" rx="2" ry="2" width="70" height="6" />
          <rect x="0" y="50" rx="2" ry="2" width="100" height="10" />
        </ContentLoader>
      </div>
    </div>
  );
};
