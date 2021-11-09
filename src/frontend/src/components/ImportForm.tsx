import { FocusEventHandler, ReactElement, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { transitionDuration, useRenderTimeout, View } from "../lib/common";
import { currentViewState } from "../store";
import Button from "./Button";

import "./ImportForm.scss";

interface ImportFormProps {
  handleImport: (value: string) => Promise<void>;
}

export default ({ handleImport }: ImportFormProps): ReactElement => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [pending, setPending] = useState(false);
  const [valid, setValid] = useState(false);
  const [value, setValue] = useState("");
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    try {
      setValue(JSON.stringify(JSON.parse(value), null, 2));
    } catch (SyntaxError) {
      // Continue
    }
  };

  useEffect(() => {
    setVisible(currentView === View.IMPORT);
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
    setTimeout(() => ref.current?.focus(), transitionDuration / 2);
  }, [visible]);

  return (
    <div
      id="import-form"
      className={visible ? "visible" : ""}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {rendered && (
        <>
          <div style={{ fontSize: "1.125em" }}>Paste JSON:</div>
          <textarea
            value={value}
            cols={50}
            rows={20}
            onChange={({ target: { value } }) => setValue(value)}
            onBlur={handleBlur}
            ref={ref}
            className={`${value !== "" ? (!valid ? "error" : "valid") : ""}`}
            spellCheck={false}
          />
          <div id="import-form-btns">
            <Button id="import-form-cancel" onClick={() => setCurrentView(View.HOME)} secondary>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPending(true);
                handleImport(value).finally(() => {
                  setPending(false);
                  setCurrentView(View.HOME);
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
