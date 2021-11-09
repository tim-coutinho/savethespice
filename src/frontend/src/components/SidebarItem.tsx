import { MouseEventHandler, ReactElement } from "react";
import { Color } from "../lib/common";
import Button from "./Button";

interface SidebarItemProps {
  categoryName: string;
  handleClick: MouseEventHandler;
  handleDelete?: MouseEventHandler;
  selected?: boolean;
  classes?: string;
}

export default ({
  categoryName,
  handleClick,
  handleDelete,
  selected,
  classes,
}: SidebarItemProps): ReactElement => {
  return (
    <li className={`${selected ? "selected-item" : ""} ${classes}`} onClick={handleClick}>
      {categoryName}
      {handleDelete && categoryName !== "All Recipes" && classes?.includes("sidebar-category") && (
        <Button
          onClick={handleDelete}
          classes="category-delete-btn"
          primaryColor={Color.OD_DARK_RED}
        >
          <i className="fa fa-trash" />
        </Button>
      )}
    </li>
  );
};
