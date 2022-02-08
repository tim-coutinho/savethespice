import {
  Anchor,
  Box,
  Chip,
  Chips,
  Divider,
  Group,
  Image,
  List,
  Paper,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { ReactElement, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { UNSET } from "../lib/common";
import {
  categoriesState,
  filteredRecipesState,
  itemToDeleteState,
  selectedCategoryIdState,
  selectedRecipeIdState,
} from "../store";
import { Category, Recipe } from "../types";

import { FlipButton } from "./FlipButton";

interface DetailsProps {
  handleDeleteRecipe: () => void;
  editRecipe: () => void;
  // shoppingList,
  // handleAddToShoppingList,
  // handleRemoveFromShoppingList,
}

export default ({ handleDeleteRecipe, editRecipe }: DetailsProps): ReactElement | null => {
  const [recipe, setRecipe] = useState({} as Recipe);
  const allCategories = useRecoilValue(categoriesState);
  const [selectedCategoryId, setSelectedCategoryId] = useRecoilState(selectedCategoryIdState);
  const recipes = useRecoilValue(filteredRecipesState);
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const setItemToDelete = useSetRecoilState(itemToDeleteState);
  const theme = useMantineTheme();

  useEffect(() => {
    const selectedRecipe = recipes.find(([id]) => id === selectedRecipeId)?.[1];
    selectedRecipe && setRecipe(selectedRecipe);
  }, [recipes, selectedRecipeId]);

  return recipe ? (
    <Paper padding="sm" sx={{ position: "relative", height: "100%", paddingRight: 0 }}>
      <Group spacing="sm" sx={{ position: "absolute", right: 10 }}>
        <FlipButton
          onClick={editRecipe}
          sx={{ transitionDuration: `${theme.other.transitionDuration}ms` }}
          length={theme.other.buttonLength}
          border
          square
        >
          <Pencil1Icon width={30} height={30} />
        </FlipButton>
        <FlipButton
          onClick={() => {
            setItemToDelete({ type: "recipe", id: selectedRecipeId });
            handleDeleteRecipe();
          }}
          color="red"
          sx={{ transitionDuration: `${theme.other.transitionDuration}ms` }}
          length={theme.other.buttonLength}
          border
          square
        >
          <TrashIcon width={30} height={30} />
        </FlipButton>
      </Group>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "300px auto",
          gridTemplateRows: "200px auto",
          gridTemplateAreas: '"tl tr" "bl br"',
          gap: theme.spacing.md,
          overflowY: "auto",
          marginTop: `calc(40px + ${theme.spacing.sm}px)`,
          marginLeft: `calc(${theme.spacing.xl}px * 4)`,
          paddingRight: `${theme.spacing.sm}px`,
          paddingBottom: `${theme.spacing.sm}px`,
          // Viewport height - button height - (top padding + top button margin)
          maxHeight: `calc(100vh - ${theme.other.buttonLength}px - ${theme.spacing.sm * 2}px)`,
        }}
      >
        <Image
          width={300}
          height={200}
          src={recipe.imgSrc}
          alt={recipe.name}
          sx={{ gridArea: "tl" }}
          withPlaceholder
        />
        <Box
          sx={{
            gridArea: "tr",
            fontWeight: 500,
            maxWidth: "65ch",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Title order={2}>{recipe.name}</Title>
          {recipe.desc && <Text weight={400}>{recipe.desc}</Text>}
          <Divider size="sm" my="xs" />
          {recipe.cookTime && (
            <div>
              <Text component="span">Cook time</Text>
              <Text component="span" weight={400}>
                : {recipe.cookTime} min
              </Text>
            </div>
          )}
          {recipe.yield && (
            <div>
              <Text component="span">Yield</Text>: {recipe.yield} serving
              {recipe.yield === 1 ? "" : "s"}
            </div>
          )}
          {recipe.adaptedFrom && (
            <div>
              <Text component="span">Adapted from</Text>{" "}
              <Anchor
                href={recipe.url}
                target="_blank"
                title="View original recipe"
                sx={{
                  color: theme.colors.blue[theme.colorScheme === "light" ? 5 : 4],
                  fontWeight: 700,
                  transition: "color 150ms",
                  "&:hover": {
                    textDecoration: "none",
                    color: (theme.colorScheme === "light" ? theme.fn.darken : theme.fn.lighten)(
                      theme.colors.blue[theme.colorScheme === "light" ? 5 : 4],
                      0.5,
                    ),
                  },
                }}
              >
                {recipe.adaptedFrom}
              </Anchor>
            </div>
          )}
          {recipe.categories && (
            <Chips
              variant="outline"
              value={`${selectedCategoryId}`}
              onChange={c => setSelectedCategoryId(+c)}
              // sx={{ transition: `${theme.other.transitionDuration}ms` }}
            >
              {recipe.categories.map(c => (
                <Chip
                  key={c}
                  value={`${c}`}
                  onClick={e => {
                    if (c === selectedCategoryId) {
                      e.preventDefault();
                      setSelectedCategoryId(UNSET);
                    }
                  }}
                >
                  {(allCategories.get(c) as Category).name}
                </Chip>
              ))}
            </Chips>
          )}
        </Box>
        <List spacing="xs" sx={{ gridArea: "bl" }}>
          {recipe.ingredients
            ?.filter(i => i.trim() !== "")
            .map((ingredient, i) => (
              <List.Item key={`${ingredient + i}`}>{ingredient}</List.Item>
            ))}
          {/*{recipe.ingredients.map((ingredient, i) => {*/}
          {/*  const ingredientInList = shoppingList.includes(ingredient);*/}
          {/*  return (*/}
          {/*    <li key={`${ingredient + i}`} className="ingredient">*/}
          {/*      <span*/}
          {/*        className="ingredient-span"*/}
          {/*        onClick={() =>*/}
          {/*          ingredientInList*/}
          {/*            ? handleRemoveFromShoppingList(ingredient)*/}
          {/*            : handleAddToShoppingList(ingredient)*/}
          {/*        }*/}
          {/*      >*/}
          {/*        {ingredientInList ? "X" : "O"}*/}
          {/*      </span>{" "}*/}
          {/*      {ingredient}*/}
          {/*    </li>*/}
          {/*  );*/}
          {/*})}*/}
        </List>
        <List spacing="md" type="order" sx={{ gridArea: "br", maxWidth: "60ch" }}>
          {recipe.instructions
            ?.filter(i => i.trim() !== "")
            .map((instruction, i) => (
              <List.Item key={`${instruction + i}`}>{instruction}</List.Item>
            ))}
        </List>
      </Box>
    </Paper>
  ) : null;
};
