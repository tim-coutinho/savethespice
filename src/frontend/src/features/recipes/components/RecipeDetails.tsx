import {
  Anchor,
  Box,
  Chip,
  Chips,
  Divider,
  Group,
  Image,
  List,
  Loader,
  Paper,
  Popover,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { Pencil1Icon, PlusCircledIcon, Share1Icon, TrashIcon } from "@radix-ui/react-icons";
import { FC, useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";

import { DeleteConfirmation, FlipButton } from "@/components/Elements";
import { useCategories } from "@/features/categories";
import { useDeleteRecipe } from "@/features/recipes";
import { useShareRecipe } from "@/features/share";
import { Recipe } from "@/lib/fetch";
import { sidebarOpenedState } from "@/stores";
import { UNSET } from "@/utils/common";

interface RecipeDetailsProps {
  recipe?: Recipe;
}

export const RecipeDetails: FC<RecipeDetailsProps> = ({ recipe: propsRecipe }) => {
  const [shareLinkExpiry, setShareLinkExpiry] = useState(0);
  const setSidebarOpened = useSetRecoilState(sidebarOpenedState);
  const theme = useMantineTheme();
  const { showNotification } = useNotifications();

  const navigate = useNavigate();
  const selectedRecipeId = +(useParams().recipeId ?? UNSET);
  const shareId = useParams().shareId;
  const [searchParams, setSearchParams] = useSearchParams();
  const outletRecipe = useOutletContext<Recipe>();

  const { data: categories } = useCategories();
  const deleteRecipeMutation = useDeleteRecipe();
  const shareRecipeMutation = useShareRecipe();

  const recipe = propsRecipe ?? outletRecipe;

  useEffect(() => {
    shareRecipeMutation.isSuccess &&
      setShareLinkExpiry(
        Math.ceil((`${shareRecipeMutation.data?.ttl}000` - Date.now()) / 1000 / 60 / 60 / 24),
      );
  }, [shareRecipeMutation.isSuccess]);

  return (
    <Paper radius={0} sx={{ height: "100vh", flexGrow: 1 }}>
      <Paper radius={0} p="sm" sx={{ position: "relative", height: "100%", paddingRight: 0 }}>
        {recipe?.name && (
          <>
            {!shareId ? (
              <Group spacing="sm" sx={{ position: "absolute", right: 10 }}>
                <Popover
                  opened={shareRecipeMutation.isSuccess}
                  onClose={shareRecipeMutation.reset}
                  position="bottom"
                  placement="end"
                  transition="scale-y"
                  target={
                    <FlipButton
                      onClick={() =>
                        !shareRecipeMutation.isSuccess &&
                        shareRecipeMutation.mutate(selectedRecipeId)
                      }
                      sx={{ transitionDuration: `${theme.other.transitionDuration}ms` }}
                      length={theme.other.buttonLength}
                      disabled={shareRecipeMutation.isLoading}
                      border
                      square
                    >
                      {shareRecipeMutation.isLoading ? (
                        <Loader size="sm" />
                      ) : (
                        <Share1Icon width={30} height={30} />
                      )}
                    </FlipButton>
                  }
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Text mr="xs">Share URL: </Text>
                    <TextInput
                      value={`${window.origin}/share/${shareRecipeMutation.data?.shareId}`}
                      readOnly
                    />
                  </div>
                  <Text size="sm" mt="xs" color={theme.primaryColor}>
                    Note: This link expires in {shareLinkExpiry} day(s).
                  </Text>
                </Popover>
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
                <DeleteConfirmation
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
                      sx={{ transitionDuration: `${theme.other.transitionDuration}ms` }}
                      border
                    >
                      Delete
                    </FlipButton>
                  }
                />
              </Group>
            ) : (
              <FlipButton
                component={Link}
                to={`/create?shareId=${shareId}`}
                size="md"
                sx={{
                  position: "absolute",
                  right: 10,
                  transitionDuration: `${theme.other.transitionDuration}ms`,
                }}
                length={theme.other.buttonLength}
                border
                square
              >
                <PlusCircledIcon width={30} height={30} />
              </FlipButton>
            )}
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
                withPlaceholder={!recipe.imgSrc}
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
                {recipe.yields && (
                  <div>
                    <Text component="span">Yield</Text>: {recipe.yields} serving
                    {recipe.yields === 1 ? "" : "s"}
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
                    value={searchParams.get("categories")?.split("|") ?? []}
                    onChange={categories => {
                      if (categories.length === 0) {
                        searchParams.delete("categories");
                        setSearchParams(searchParams);
                      } else {
                        setSearchParams({ ...searchParams, categories: categories.join("|") });
                      }
                    }}
                    multiple
                  >
                    {recipe.categories.map(
                      c =>
                        categories?.get(c)?.name && (
                          <Chip key={c} value={`${c}`}>
                            {categories.get(c)?.name}
                          </Chip>
                        ),
                    )}
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
              <List spacing="md" type="ordered" sx={{ gridArea: "br", maxWidth: "60ch" }}>
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
