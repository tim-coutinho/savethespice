import React from "react";

import Button from "./Button";
import colors from "../utils/colors";

import "./DeleteForm.scss";

export default function DeleteForm({ handleDeleteRecipe, visible }) {
  return (
    <div id="delete-form" className={`${visible ? "visible" : ""} card`}>
      <span style={{ fontSize: "18px" }}>Permanently delete recipe?</span>
      <br />
      <span style={{ fontWeight: "initial" }}>This cannot be undone.</span>
      <hr />
      <div id="buttons">
        <Button
          id="delete-form-cancel"
          onClick={() => handleDeleteRecipe(false)}
          primaryColor={colors.WHITE}
          secondaryColor={colors.OD_PURPLE}
          secondary
        >
          Cancel
        </Button>
        <Button onClick={() => handleDeleteRecipe(true)} primaryColor={colors.OD_DARK_RED}>
          Delete
        </Button>
      </div>
    </div>
  );
}
