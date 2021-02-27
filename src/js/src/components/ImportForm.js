import React, { useContext, useEffect, useRef } from "react";

import { ImportContext } from "../utils/context";

// import Button from "./Button";
// import { colors } from "../utils/colors";

import "./ImportForm.scss";

export default () => {
  const ref = useRef(null);
  const {
    importString,
    setImportString,
    importValid: valid,
    setImportValid: setValid,
    importVisible: visible,
  } = useContext(ImportContext);

  const handleChange = ({ target: { value } }) => {
    setImportString(value);
    try {
      JSON.parse(value);
      setValid(true);
    } catch {
      setValid(false);
    }
  };

  const handleBlur = () => {
    try {
      setImportString(JSON.stringify(JSON.parse(importString), null, 2));
    } catch (SyntaxError) {
      // Continue
    }
  };

  useEffect(() => {
    if (!visible) {
      return;
    }
    setImportString("");
    setValid(false);
    setTimeout(() => ref.current.focus(), 100);
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
        className={`${importString !== "" ? (!valid ? "error" : "valid") : ""}`}
        spellCheck={false}
      />
    </span>
  );
};
