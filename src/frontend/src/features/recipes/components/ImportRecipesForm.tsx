import { JsonInput, Modal } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { FC, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FlipButton } from "@/components/Elements";
import { Recipe, useCreateRecipes } from "@/features/recipes";

export const ImportRecipesForm: FC = () => {
  const [value, setValue] = useInputState("");
  const addRecipesMutation = useCreateRecipes();

  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const formVisible = pathname.endsWith("import");

  const invalidForm = useMemo(() => {
    try {
      const importObject = JSON.parse(value);
      return !importObject.length;
    } catch {
      return true;
    }
  }, [value]);

  useEffect(() => {
    formVisible && setValue("");
  }, [formVisible]);

  return (
    <Modal title="Paste JSON" opened={formVisible} onClose={() => navigate(`/${search}`)}>
      <JsonInput
        validationError="Invalid JSON"
        value={value}
        onChange={setValue}
        minRows={30}
        formatOnBlur
      />
      <FlipButton
        onClick={async () => {
          const recipes: Recipe[] = JSON.parse(value);
          await addRecipesMutation.mutateAsync(recipes).then(() => navigate(`/${search}`));
        }}
        loading={addRecipesMutation.isLoading}
        disabled={invalidForm}
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
