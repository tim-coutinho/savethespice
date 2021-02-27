import React, { useContext } from "react";

import { ViewContext } from "../utils/context";
import { colors, Views } from "../utils/common";

import Button from "./Button";
import "./Header.scss";

export default function Header({ category, filter, handleFilterChange, handleViewChange }) {
  const currentView = useContext(ViewContext);

  return (
    <header>
      <Button id="sidebar-btn" classes="header-btn" onClick={handleViewChange(Views.SIDEBAR)}>
        <i className={`fa fa-${currentView === Views.SIDEBAR ? "arrow-left" : "bars"}`} />
      </Button>
      <span>
        <h3 id="category-label" style={filter !== "" ? { opacity: "0" } : {}}>
          {category}
        </h3>
        <span
          id="filter-wrapper"
          style={
            filter !== ""
              ? { backgroundColor: "white", color: colors.OD_PURPLE, width: "100%" }
              : {}
          }
        >
          <input id="filter" value={filter} onChange={handleFilterChange} />
          <button type="button" id="filter-btn" className="header-btn">
            <i className="fa fa-search" />
          </button>
        </span>
      </span>
      <Button id="add-btn" classes="header-btn" onClick={handleViewChange(Views.ADD)}>
        <i className="fa fa-plus" />
      </Button>
    </header>
  );
}
