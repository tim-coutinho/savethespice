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
import { useNotifications } from "@mantine/notifications";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { FC, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";

import { FlipButton } from "@/components/Elements";
import { Confirmation } from "@/components/Elements/DeleteConfirmation/Confirmation";
import { Category, useCategories } from "@/features/categories";
import { Recipe, useDeleteRecipe, useRecipes } from "@/features/recipes";
import { sidebarOpenedState } from "@/stores";
import { UNSET } from "@/utils/common";

export const RecipeDetails: FC = () => {
  const [recipe, setRecipe] = useState({} as Recipe);
  const setSidebarOpened = useSetRecoilState(sidebarOpenedState);
  const theme = useMantineTheme();
  const { showNotification } = useNotifications();

  const navigate = useNavigate();
  const selectedRecipeId = +(useParams().recipeId ?? UNSET);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: recipes } = useRecipes();
  const { data: categories } = useCategories();
  const deleteRecipeMutation = useDeleteRecipe();

  useEffect(() => {
    const selectedRecipe = recipes?.get(selectedRecipeId);
    setRecipe(selectedRecipe || ({} as Recipe));
  }, [recipes, selectedRecipeId]);

  return (
    <Paper radius={0} sx={{ height: "100vh", flexGrow: 1 }}>
      <Paper padding="sm" sx={{ position: "relative", height: "100%", paddingRight: 0 }}>
        {recipe.recipeId && (
          <>
            <Group spacing="sm" sx={{ position: "absolute", right: 10 }}>
              <FlipButton
                component={Link}
                to={`edit?${searchParams}`}
                onClick={() => setSidebarOpened(false)}
                sx={{ transitionDuration: `${theme.other.transitionDuration}ms` }}
                length={theme.other.buttonLength}
                border
                square
              >
                <Pencil1Icon width={30} height={30} />
              </FlipButton>
              <Confirmation
                active={!deleteRecipeMutation.isSuccess}
                title="Permanently delete recipe?"
                message="This cannot be undone."
                triggerButton={
                  <FlipButton
                    color="red"
                    sx={{ transitionDuration: `${theme.other.transitionDuration}ms` }}
                    length={theme.other.buttonLength}
                    border
                    square
                  >
                    <TrashIcon width={30} height={30} />
                  </FlipButton>
                }
                confirmButton={
                  <FlipButton
                    color="red"
                    onClick={() => {
                      if (selectedRecipeId !== UNSET) {
                        deleteRecipeMutation.mutate(selectedRecipeId, {
                          onSuccess: () => {
                            showNotification({ message: "Recipe deleted!" });
                          },
                        });
                        navigate(`/?${searchParams}`);
                      }
                    }}
                    sx={theme => ({ transitionDuration: `${theme.other.transitionDuration}ms` })}
                    border
                  >
                    Delete
                  </FlipButton>
                }
              />
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
                maxHeight: `calc(100vh - ${theme.other.buttonLength}px - ${
                  theme.spacing.sm * 2
                }px)`,
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
                          color: (theme.colorScheme === "light"
                            ? theme.fn.darken
                            : theme.fn.lighten)(
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
                    value={searchParams.get("categories")?.split(",") ?? []}
                    onChange={categories => {
                      if (categories.length === 0) {
                        searchParams.delete("categories");
                        setSearchParams(searchParams);
                      } else {
                        setSearchParams({ ...searchParams, categories: categories.join(",") });
                      }
                    }}
                    multiple
                  >
                    {recipe.categories.map(c => (
                      <Chip key={c} value={`${c}`}>
                        {(categories?.get(c) as Category).name}
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
              </List>
              <List spacing="md" type="order" sx={{ gridArea: "br", maxWidth: "60ch" }}>
                {recipe.instructions
                  ?.filter(i => i.trim() !== "")
                  .map((instruction, i) => (
                    <List.Item key={`${instruction + i}`}>{instruction}</List.Item>
                  ))}
              </List>
            </Box>
          </>
        )}
      </Paper>
    </Paper>
  );
};
