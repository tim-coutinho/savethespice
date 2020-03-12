import React, { useEffect, useRef, useState } from "react";

import "./Header.scss";

export default function Header(props) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);

  const toggleFocus = () => {
    props.filter === "" && setFocused(!focused);
  };

  useEffect(() => {
    focused
      ? setTimeout(() => ref.current.focus(), 50)
      : props.filter === "" && ref.current.blur();
  });

  return (
    <div id="header" className={focused ? "filter-focused" : ""}>
      <div
        id="sidebar-btn"
        className="header-btn primary-btn"
        onClick={props.handleViewChange("Sidebar")}
      >
        <i className={`fa fa-${props.shiftedRight ? "arrow-left" : "bars"}`} />
      </div>
      <div
        id="filter-wrapper"
        onClick={() => !focused && toggleFocus()}
        className={`${focused ? "filter-focused" : ""} header-btn primary-btn`}
      >
        <input
          id="filter"
          onBlur={toggleFocus}
          onChange={props.handleFilterChange}
          ref={ref}
          value={props.filter}
        />
      </div>
      <div
        id="add-btn"
        className="header-btn primary-btn"
        onClick={props.handleViewChange("Add")}
      >
        <i className="fa fa-plus" />
      </div>
    </div>
  );
}
