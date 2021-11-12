import { FocusEventHandler, ReactElement, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { transitionDuration, View } from "../lib/common";
import { allRecipesState, currentViewState } from "../store";
import Button from "./Button";

import "./ImportForm.scss";
import { AsyncRequestStatus, useAsync, useRenderTimeout } from "../lib/hooks";
import { addRecipes } from "../lib/operations";
import { Recipe } from "../types";

export default (): ReactElement => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [valid, setValid] = useState(false);
  const [value, setValue] = useState("");
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);
  const [execute, request] = useAsync(addRecipes);

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    try {
      setValue(JSON.stringify(JSON.parse(value), null, 2));
    } catch (SyntaxError) {
      // Continue
    }
  };

  useEffect(() => {
    if (request.status === AsyncRequestStatus.SUCCESS) {
      const { value } = request;
      if (value?.recipes) {
        setAllRecipes(new Map(value.recipes.map(r => [r.recipeId, r])));
      }
    }
  }, [request]);

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
                const recipes: Recipe[] = JSON.parse(value);
                execute(recipes).finally(() => setCurrentView(View.HOME));
              }}
              disabled={request.status === AsyncRequestStatus.PENDING || !valid}
            >
              Import
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
