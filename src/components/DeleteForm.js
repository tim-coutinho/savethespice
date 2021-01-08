import React from "react";

import Button from "./Button";

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
          primaryColor="#FFFFFF"
          secondaryColor="#C678DD"
          secondary
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleDeleteRecipe(true)}
          primaryColor="#BE5046"
          secondaryColor="#FFFFFF"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
