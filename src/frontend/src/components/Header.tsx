import {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  useRef,
} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Color, View } from "../lib/common";
import { categoriesState, currentViewState, filterState, selectedCategoryIdState } from "../store";

import Button from "./Button";
import "./Header.scss";

interface HeaderProps {
  handleViewChange: (source: typeof View[keyof typeof View]) => MouseEventHandler;
}

export default ({ handleViewChange }: HeaderProps): ReactElement => {
  const ref = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useRecoilState(filterState);
  const currentView = useRecoilValue(currentViewState);
  const categories = useRecoilValue(categoriesState);
  const selectedCategoryId = useRecoilValue(selectedCategoryIdState);

  const handleFilterChange: ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    setFilter(currentTarget.value);
  };

  const handleBlur: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === "Escape") {
      setFilter("");
      ref.current?.blur();
    }
  };

  return (
    <header>
      <Button id="sidebar-btn" classes="header-btn" onClick={handleViewChange(View.SIDEBAR)}>
        <i className={`fa fa-${currentView === View.SIDEBAR ? "arrow-left" : "bars"}`} />
      </Button>
      <span>
        <h3 id="category-label" style={filter !== "" ? { opacity: "0" } : {}}>
          {categories.get(+selectedCategoryId)?.name ?? "All Recipes"}
        </h3>
        <span
          id="filter-wrapper"
          style={
            filter !== "" ? { backgroundColor: "white", color: Color.OD_PURPLE, width: "100%" } : {}
          }
        >
          <input
            id="filter"
            value={filter}
            onChange={handleFilterChange}
            onKeyDown={handleBlur}
            ref={ref}
          />
          <button type="button" id="filter-btn" className="header-btn">
            <i className="fa fa-search" />
          </button>
        </span>
      </span>
      <Button id="add-btn" classes="header-btn" onClick={handleViewChange(View.ADD)}>
        <i className="fa fa-plus" />
      </Button>
    </header>
  );
};
