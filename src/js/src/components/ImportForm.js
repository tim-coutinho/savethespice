import React, { useRef, useEffect, useState } from "react";

import Button from "./Button";
import colors from "../utils/colors";

import "./ImportForm.scss";

export default function ImportForm({
  handleAddRecipe,
  visible,
  setValid,
  valid,
  importString,
  setImportString,
}) {
  const ref = useRef(null);

  const handleChange = ({ target: { value } }) => {
    setImportString(value);
    try {
      JSON.parse(value);
      setValid(true);
    } catch {
      setValid(false);
    }
  };

  const handleImport = () => {
    const recipes = JSON.parse(importString);
    recipes.forEach(recipe => handleAddRecipe(recipe));
  };

  const handleBlur = () => {
    try {
      setImportString(JSON.stringify(JSON.parse(importString), null, 2));
    } catch (SyntaxError) {}
  };

  useEffect(() => {
    if (visible) {
      setImportString("");
      setValid(false);
      // ref.current.focus();
    }
  }, [visible]);

  return (
    <span id="import-form">
      <textarea
        value={importString}
        cols="50"
        rows="20"
        onChange={handleChange}
        onBlur={handleBlur}
        ref={ref}
        className={`${importString !== "" && !valid ? "error" : ""}`}
      />
    </span>
  );
}
