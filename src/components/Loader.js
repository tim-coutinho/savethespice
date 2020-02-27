import React from "react";
import ContentLoader from "react-content-loader";

const Loader = (props) => (
    <ContentLoader
        speed={1}
        width={352}
        height={101}
        viewBox="0 0 352 101"
        backgroundColor="#f3f3f3"
        foregroundColor="#dddddd"
    >
        <rect x="0" y="8" rx="3" ry="3" width="120" height="10" />
        <rect x="0" y="30" rx="3" ry="3" width="80" height="6" />
        <rect x="200" y="0" rx="0" ry="0" width="150" height="100" />
    </ContentLoader>
);

export default Loader;
