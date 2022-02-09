import { ReactElement, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { allRecipesState, filteredRecipesState, selectedRecipeIdState } from "../store";

import { AsyncRequestStatus, useAsync } from "../lib/hooks";
import { getAllRecipes } from "../lib/operations";
import { Box, Group, Image, Skeleton, Text } from "@mantine/core";
import { UNSET } from "../lib/common";

export default (): ReactElement => {
  const ref = useRef<HTMLUListElement>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useRecoilState(selectedRecipeIdState);
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const recipes = useRecoilValue(filteredRecipesState);
  const [execute, request] = useAsync(getAllRecipes);

  useEffect(() => {
    execute();
  }, []);

  useEffect(() => {
    request.value && setAllRecipes(new Map(request.value.recipes.map(r => [r.recipeId, r])));
  }, [request.status]);

  useEffect(() => {
    if (recipes.length === 0) {
      return;
    }
    ref.current?.querySelectorAll("[data-src]").forEach(image =>
      new IntersectionObserver((entries, observer) => {
        entries
          .filter(({ isIntersecting }) => isIntersecting)
          .forEach(({ target }) => {
            target.setAttribute("src", target.getAttribute("data-src") as string);
            target.removeAttribute("data-src");
            observer.unobserve(target);
          });
      }).observe(image),
    );
  }, [recipes]);

  function createLoadingRecipes(): typeof recipes {
    return Array(5)
      .fill(0)
      .map((_, i) => [i, { userId: "", recipeId: -1, name: "", createTime: "", updateTime: "" }]);
  }

  return (
    <Group
      direction="column"
      spacing={0}
      sx={{ overflowX: "hidden", overflowY: "auto" }}
      grow
      noWrap
    >
      {(request.status === AsyncRequestStatus.PENDING ? createLoadingRecipes() : recipes).map(
        ([recipeId, recipe]) => (
          <Box
            key={recipeId}
            onClick={() => setSelectedRecipeId(recipeId)}
            className={selectedRecipeId === recipeId ? "selected" : ""}
            sx={theme => ({
              cursor: "pointer",
              transition: `background-color 50ms`,
              "&:not(:first-of-type) > div:first-of-type": {
                borderTop: `1px solid ${theme.colors.gray[7]}`,
              },
              "&.selected": {
                backgroundColor:
                  theme.colorScheme === "light" ? theme.colors.gray[4] : theme.colors.dark[4],
                "> div:first-of-type": { borderTopColor: "transparent" },
                "+ div > div:first-of-type": { borderTopColor: "transparent" },
              },
              "&:hover:not(.selected)": {
                backgroundColor:
                  theme.colorScheme === "light"
                    ? theme.fn.rgba(theme.colors.gray[4], 0.4)
                    : theme.fn.rgba(theme.colors.dark[4], 0.3),
              },
            })}
          >
            <Box
              sx={theme => ({
                display: "grid",
                gridTemplateColumns: "auto 120px",
                alignItems: "center",
                justifyContent: "space-between",
                margin: `0 ${theme.spacing.md}px`,
                padding: `${theme.spacing.md}px 0`,
              })}
            >
              {recipe.recipeId === UNSET ? (
                <div>
                  <Skeleton width={200} height="1em" />
                  <Skeleton width={100} height="1em" mt={6} />
                </div>
              ) : (
                <Text>{recipe.name}</Text>
              )}
              {recipe.recipeId === UNSET ? (
                <Skeleton width={120} height={80} radius={0} />
              ) : (
                <Image
                  width={120}
                  height={80}
                  src={recipe.imgSrc}
                  sx={{ position: "relative" }}
                  styles={{ placeholder: { width: 120 } }}
                  withPlaceholder
                />
              )}
            </Box>
          </Box>
        ),
      )}
    </Group>
  );
};
