import React from "react";

import "./DeleteForm.scss";

export default function DeleteForm({ handleDeleteRecipe, visible }) {
  return (
    <div id="delete-form" className={`${visible ? "visible" : ""} card`}>
      <span style={{ fontSize: "18px" }}>Permanently delete recipe?</span>
      <br />
      <span style={{ fontWeight: "initial" }}>This cannot be undone.</span>
      <hr />
      <div id="buttons">
        <span
          id="delete-form-cancel"
          className="primary-btn"
          onClick={() => handleDeleteRecipe(false)}
        >
          Cancel
        </span>
        <span
          id="delete-form-delete"
          className="primary-btn"
          onClick={() => handleDeleteRecipe(true)}
        >
          Delete
        </span>
      </div>
    </div>
  );
}
