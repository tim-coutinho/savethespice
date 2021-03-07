import React, { useContext } from "react";

import { ViewContext } from "../lib/context";
import { colors, Views } from "../lib/common";

import Button from "./Button";

import "./DeleteForm.scss";

export default function DeleteForm({ handleDeleteRecipe }) {
  const currentView = useContext(ViewContext);

  return (
    <div id="delete-form" className={`${currentView === Views.DELETE ? "visible" : ""} card`}>
      <span style={{ fontSize: "18px" }}>Permanently delete recipe?</span>
      <br />
      <span style={{ fontWeight: "initial" }}>This cannot be undone.</span>
      <hr />
      <div id="buttons">
        <Button id="delete-form-cancel" onClick={() => handleDeleteRecipe(false)} secondary>
          Cancel
        </Button>
        <Button onClick={() => handleDeleteRecipe(true)} primaryColor={colors.OD_DARK_RED}>
          Delete
        </Button>
      </div>
    </div>
  );
}
