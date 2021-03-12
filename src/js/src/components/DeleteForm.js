import React, { useContext } from "react";

import { ViewContext } from "../lib/context";
import { colors, Views } from "../lib/common";

import Button from "./Button";

import "./DeleteForm.scss";

export default function DeleteForm({ handleDelete }) {
  const currentView = useContext(ViewContext);

  return (
    <div
      id="delete-form"
      className={`${
        currentView === Views.DELETE_RECIPE || currentView === Views.DELETE_CATEGORY
          ? "visible"
          : ""
      } card`}
    >
      <span style={{ fontSize: "18px" }}>
        Permanently delete {currentView === Views.DELETE_RECIPE ? "recipe" : "category"}?
      </span>
      <br />
      <span style={{ fontWeight: "initial" }}>This cannot be undone.</span>
      <hr />
      <div id="buttons">
        <Button id="delete-form-cancel" onClick={() => handleDelete(false)} secondary>
          Cancel
        </Button>
        <Button onClick={() => handleDelete(true)} primaryColor={colors.OD_DARK_RED}>
          Delete
        </Button>
      </div>
    </div>
  );
}
