import { Button } from "@mantine/core";
import { MouseEventHandler, ReactElement } from "react";

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
        <Button onClick={handleDelete} className="category-delete-btn" color="red">
          <i className="fa fa-trash" />
        </Button>
      )}
    </li>
  );
};
