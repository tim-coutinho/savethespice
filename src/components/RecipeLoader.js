import React from "react";
import ContentLoader from "react-content-loader";

const RecipeLoader = () => (
    <div className={"recipe-wrapper"}>
        <li className="recipe loading">
            <ContentLoader
                speed={1}
                width={300}
                height={76}
                viewBox="0 0 300 81"
                backgroundColor="#f3f3f3"
                foregroundColor="#dddddd"
            >
                <rect x="0" y="8" rx="3" ry="3" width="120" height="10"/>
                <rect x="0" y="30" rx="3" ry="3" width="80" height="6"/>
                <rect x="160" y="0" rx="0" ry="0" width="127" height="80"/>
            </ContentLoader>
        </li>
    </div>
);

export default RecipeLoader;
