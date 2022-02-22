import { JsonInput, Modal } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { ReactElement, useEffect, useMemo } from "react";
import { useRecoilState } from "recoil";

import { FlipButton } from "@/components/Elements";
import { useCreateRecipes, Recipe } from "@/features/recipes";
import { currentViewState } from "@/stores";
import { View } from "@/utils/common";

export function ImportRecipesForm(): ReactElement {
  const [value, setValue] = useInputState("");
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const addRecipesMutation = useCreateRecipes();

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
}
