import { JsonInput, Modal } from "@mantine/core";
import { ReactElement, useEffect, useMemo } from "react";
import { useRecoilState } from "recoil";
import { View } from "../lib/common";
import { addRecipes } from "../lib/operations";
import { currentViewState } from "../store";
import { Recipe } from "../types";

import { FlipButton } from "./FlipButton";
import { useInputState } from "@mantine/hooks";
import { useMutation } from "react-query";
import { queryClient, useAddRecipes } from "../lib/hooks";

export default (): ReactElement => {
  const [value, setValue] = useInputState("");
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const addRecipesMutation = useAddRecipes();

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
    if (!formVisible) {
      return;
    }
    setValue("");
  }, [formVisible]);

  return (
    <Modal title="Paste JSON" opened={formVisible} onClose={() => setCurrentView(View.HOME)}>
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
          addRecipesMutation.mutate(recipes);
          setCurrentView(View.HOME);
        }}
        disabled={addRecipesMutation.isLoading || invalidForm}
        mt="md"
        sx={theme => ({
          float: "right",
          transitionDuration: `${theme.other.transitionDuration}ms`,
        })}
        border
      >
        Import
      </FlipButton>
    </Modal>
  );
};
