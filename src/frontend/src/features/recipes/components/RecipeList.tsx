import { Box, Group, Image, Skeleton, Text } from "@mantine/core";
import { FC, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { Recipe, useRecipes } from "@/features/recipes";
import { filterOptionsState, filterState } from "@/stores";
import { UNSET } from "@/utils/common";

export const RecipeList: FC = () => {
  const ref = useRef<HTMLUListElement>(null);
  const [filteredRecipes, setFilteredRecipes] = useState<[number, Recipe][]>([]);
  const [searchParams] = useSearchParams();
  const selectedRecipeId = +(useParams().recipeId ?? UNSET);

  const { data: recipes } = useRecipes();

  const filter = useRecoilValue(filterState);
  const filterOptions = useRecoilValue(filterOptionsState);

  useEffect(() => {
    if (!recipes) {
      return;
    }
    const categoryFilter = searchParams.get("categories")?.split("|");
    setFilteredRecipes(
      Array.from(recipes)
        .filter(([, recipe]) => {
          if (categoryFilter && !categoryFilter.every(c => recipe.categories?.includes(+c))) {
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
  }, [recipes, filter, filterOptions, searchParams]);

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
      sx={theme => ({
        overflowX: "hidden",
        overflowY: "auto",
        a: {
          textDecoration: "none",
          color: theme.colorScheme === "light" ? theme.black : theme.colors.dark[0],
        },
      })}
      grow
      noWrap
    >
      {filteredRecipes.map(([recipeId, recipe]) => (
        <Box
          key={recipeId}
          component={Link}
          to={`/recipes/${recipeId}?${searchParams}`}
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
              "+ a > div:first-of-type": { borderTopColor: "transparent" },
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
};
