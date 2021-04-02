import React, { useContext, useEffect, useRef, useState } from "react";
import { useRenderTimeout, Views } from "../lib/common";

import { ViewContext } from "../lib/context";

import "./ImportForm.scss";
import Button from "./Button";

const transitionDuration = 300;

export default ({ handleImport }) => {
  const ref = useRef(null);
  const { currentView, setCurrentView } = useContext(ViewContext);
  const [pending, setPending] = useState(false);
  const [valid, setValid] = useState(false);
  const [value, setValue] = useState("");
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

  const handleBlur = () => {
    try {
      setValue(JSON.stringify(JSON.parse(value), null, 2));
    } catch (SyntaxError) {
      // Continue
    }
  };

  useEffect(() => {
    setVisible(currentView === Views.IMPORT);
  }, [currentView]);

  useEffect(() => {
    try {
      const importObject = JSON.parse(value);
      setValid(importObject.length > 0);
    } catch {
      setValid(false);
    }
  }, [value]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setValue("");
    setValid(false);
    setTimeout(() => ref.current.focus(), transitionDuration / 2);
  }, [visible]);

  return (
    <div
      id="import-form"
      className={`${visible ? "visible" : ""} card`}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {rendered && (
        <>
          <div style={{ fontSize: "1.125em" }}>Paste JSON:</div>
          <textarea
            value={value}
            cols="50"
            rows="20"
            onChange={({ target: { value } }) => setValue(value)}
            onBlur={handleBlur}
            ref={ref}
            className={`${value !== "" ? (!valid ? "error" : "valid") : ""}`}
            spellCheck={false}
          />
          <div id="import-form-buttons">
            <Button id="import-form-cancel" onClick={() => setCurrentView(Views.HOME)} secondary>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPending(true);
                handleImport(value).finally(() => {
                  setPending(false);
                  setCurrentView(Views.HOME);
                });
              }}
              disabled={pending || !valid}
            >
              Import
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
