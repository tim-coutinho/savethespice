import { Box, Group, Image, Skeleton, Text } from "@mantine/core";
import { ReactElement, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { UNSET } from "@/lib/common";
import { useRecipes } from "@/lib/hooks";
import {
  filterOptionsState,
  filterState,
  selectedCategoryIdState,
  selectedRecipeIdState,
} from "@/store";
import { Recipe } from "@/types";

export default function RecipeList(): ReactElement {
  const ref = useRef<HTMLUListElement>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useRecoilState(selectedRecipeIdState);
  const [filteredRecipes, setFilteredRecipes] = useState<[number, Recipe][]>([]);
  const recipesQuery = useRecipes();

  const filter = useRecoilValue(filterState);
  const filterOptions = useRecoilValue(filterOptionsState);
  const selectedCategoryId = useRecoilValue(selectedCategoryIdState);

  useEffect(() => {
    if (!recipesQuery.data) {
      return;
    }
    setFilteredRecipes(
      Array.from(recipesQuery.data)
        .filter(([, recipe]) => {
          if (selectedCategoryId !== UNSET && !recipe.categories?.includes(selectedCategoryId)) {
            return false;
          }
          if (filter === "") {
            return true;
          }

          const { name, desc, ingredients, instructions } = filterOptions;
          if (name && recipe.name.toLowerCase().includes(filter.toLowerCase())) {
            return true;
          } else if (desc && recipe.desc?.toLowerCase().includes(filter.toLowerCase())) {
            return true;
          } else if (
            ingredients &&
            recipe.ingredients?.some(i => i.includes(filter.toLowerCase()))
          ) {
            return true;
          } else if (
            instructions &&
            recipe.instructions?.some(i => i.includes(filter.toLowerCase()))
          ) {
            return true;
          }
          return false;
        })
        .sort(([, { createTime: time1 }], [, { createTime: time2 }]) => (time1 <= time2 ? 1 : -1)),
    );
  }, [recipesQuery.data, filter, filterOptions, selectedCategoryId]);

  useEffect(() => {
    if (filteredRecipes.length === 0) {
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
  }, [filteredRecipes]);

  return (
    <Group
      direction="column"
      spacing={0}
      sx={{ overflowX: "hidden", overflowY: "auto" }}
      grow
      noWrap
    >
      {filteredRecipes.map(([recipeId, recipe]) => (
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
      ))}
    </Group>
  );
}
