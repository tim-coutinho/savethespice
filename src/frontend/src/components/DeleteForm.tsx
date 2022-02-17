import { Button, Group, Modal, Text } from "@mantine/core";
import { ReactElement } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { UNSET, View } from "../lib/common";
import {
  currentViewState,
  itemToDeleteState,
  selectedCategoryIdState,
  selectedRecipeIdState,
} from "../store";
import { FlipButton } from "./FlipButton";
import { useDeleteCategory, useDeleteRecipe } from "../lib/hooks";

export default function DeleteForm(): ReactElement {
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [selectedCategoryId, setSelectedCategoryId] = useRecoilState(selectedCategoryIdState);
  const [selectedRecipeId, setSelectedRecipeId] = useRecoilState(selectedRecipeIdState);
  const itemToDelete = useRecoilValue(itemToDeleteState);
  const { mutate: deleteRecipe } = useDeleteRecipe();
  const { mutate: deleteCategory } = useDeleteCategory();

  return (
    <Modal
      title={`Permanently delete ${itemToDelete.type}?`}
      opened={currentView === View.DELETE}
      onClose={() => setCurrentView(View.HOME)}
    >
      <Text size="sm">This cannot be undone.</Text>
      <Group position="right" mt="md">
        <Button variant="default" onClick={() => setCurrentView(View.HOME)}>
          Cancel
        </Button>
        <FlipButton
          color="red"
          onClick={() => {
            const { id, type } = itemToDelete;
            if (id !== -1) {
              if (type === "recipe") {
                deleteRecipe(id);
                id === selectedRecipeId && setSelectedRecipeId(UNSET);
              } else {
                deleteCategory(id);
                id === selectedCategoryId && setSelectedCategoryId(UNSET);
              }
            }
            setCurrentView(View.HOME);
          }}
          sx={theme => ({ transitionDuration: `${theme.other.transitionDuration}ms` })}
          border
        >
          Delete
        </FlipButton>
      </Group>
    </Modal>
  );
}
