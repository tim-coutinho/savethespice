import { JsonInput, Modal } from "@mantine/core";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { transitionDuration, View } from "../lib/common";
import { AsyncRequestStatus, useAsync } from "../lib/hooks";
import { addRecipes } from "../lib/operations";
import { allRecipesState, currentViewState } from "../store";
import { Recipe } from "../types";

import { FlipButton } from "./FlipButton";

export default (): ReactElement => {
  const [value, setValue] = useState("");
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const [execute, request] = useAsync(addRecipes);

  const handleClose = () => setCurrentView(View.HOME);

  const formVisible = useMemo(() => currentView === View.IMPORT, [currentView]);
  const invalidForm = useMemo(() => {
    try {
      const importObject = JSON.parse(value);
      return !importObject.length;
    } catch {
      return true;
    }
  }, [value]);

  useEffect(() => {
    if (request.status === AsyncRequestStatus.SUCCESS && request.value?.recipes) {
      setAllRecipes(new Map(request.value.recipes.map(r => [r.recipeId, r])));
    }
  }, [request.status]);

  useEffect(() => {
    if (!formVisible) {
      return;
    }
    setValue("");
  }, [formVisible]);

  return (
    <Modal title="Paste JSON" opened={formVisible} onClose={handleClose}>
      <JsonInput
        validationError="Invalid JSON"
        value={value}
        onChange={setValue}
        minRows={30}
        formatOnBlur
      />
      <FlipButton
        onClick={() => {
          const recipes: Recipe[] = JSON.parse(value);
          execute(recipes).finally(handleClose);
        }}
        disabled={request.status === AsyncRequestStatus.PENDING || invalidForm}
        mt="md"
        sx={{ float: "right", transitionDuration: `${transitionDuration}ms` }}
        border
      >
        Import
      </FlipButton>
    </Modal>
  );
};
