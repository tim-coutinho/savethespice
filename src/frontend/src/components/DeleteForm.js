import React, { useContext, useEffect, useState } from "react";

import { ViewContext } from "../lib/context";
import { colors, useRenderTimeout, Views } from "../lib/common";

import Button from "./Button";

import "./DeleteForm.scss";

const transitionDuration = 300;

export default function DeleteForm({ handleDelete }) {
  const { currentView, setCurrentView } = useContext(ViewContext);
  const [pending, setPending] = useState(false);
  const [type, setType] = useState("");
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

  useEffect(() => {
    if (currentView !== Views.HOME) {
      setType(currentView === Views.DELETE_RECIPE ? "recipe" : "category");
    }
    setVisible(currentView === Views.DELETE_RECIPE || currentView === Views.DELETE_CATEGORY);
  }, [currentView]);

  return (
    <div
      id="delete-form"
      className={`${visible ? "visible" : ""} card`}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {rendered && (
        <>
          <div style={{ fontSize: "1.125em" }}>Permanently delete {type}?</div>
          <span style={{ fontWeight: "initial" }}>This cannot be undone.</span>
          <hr />
          <div id="delete-form-buttons">
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
        </>
      )}
    </div>
  );
}
