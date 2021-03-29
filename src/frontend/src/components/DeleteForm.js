import React, { useContext, useState } from "react";

import { ViewContext } from "../lib/context";
import { colors, Views } from "../lib/common";

import Button from "./Button";

import "./DeleteForm.scss";

export default function DeleteForm({ handleDelete }) {
  const { currentView, setCurrentView } = useContext(ViewContext);
  const [pending, setPending] = useState(false);

  return (
    <div
      id="delete-form"
      className={`${
        currentView === Views.DELETE_RECIPE || currentView === Views.DELETE_CATEGORY
          ? "visible"
          : ""
      } card`}
    >
      <span style={{ fontSize: "1.125em" }}>
        Permanently delete {currentView === Views.DELETE_RECIPE ? "recipe" : "category"}?
      </span>
      <br />
      <span style={{ fontWeight: "initial" }}>This cannot be undone.</span>
      <hr />
      <div id="buttons">
        <Button id="delete-form-cancel" onClick={() => setCurrentView(Views.HOME)} secondary>
          Cancel
        </Button>
        <Button
          onClick={() => {
            setPending(true);
            handleDelete().finally(() => {
              setPending(false);
              setCurrentView(Views.HOME);
            });
          }}
          primaryColor={colors.OD_DARK_RED}
          disabled={pending}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
