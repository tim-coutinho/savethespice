import { Paper, useMantineTheme } from "@mantine/core";
import { ReactElement, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { Header, Sidebar } from "@/components/Layout";
import { useRefreshIdToken } from "@/features/auth";
import { CreateRecipeForm, ImportRecipesForm, RecipeList, useRecipes } from "@/features/recipes";
import { Recipe } from "@/lib/fetch";
import { sidebarOpenedState } from "@/stores";
import { prefix, UNSET } from "@/utils/common";

export default function App(): ReactElement {
  const sidebarOpened = useRecoilValue(sidebarOpenedState);
  const theme = useMantineTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRecipeId = +(useParams().recipeId ?? UNSET);

  const refreshIdTokenMutation = useRefreshIdToken();

  const { data: recipes } = useRecipes();

  useEffect(() => {
    localStorage.setItem(`${prefix}theme`, theme.colorScheme);
  }, [theme.colorScheme]);

  useEffect(() => {
    refreshIdTokenMutation.mutate(undefined, {
      onError: () =>
        navigate("/auth", {
          state: { from: `${location.pathname}${location.search}` },
          replace: true,
        }),
    });
  }, []);

  return (
    <Paper
      id="app"
      radius={0}
      sx={theme => ({
        "&[data-themechange], &[data-themechange] *": {
          transition: `${theme.other.transitionDuration}ms !important`,
        },
      })}
    >
      <Sidebar />
      <Paper
        radius={0}
        className={sidebarOpened ? "shifted-right" : ""}
        sx={theme => ({
          display: "flex",
          float: "right",
          transitionDuration: `${theme.other.transitionDuration}ms`,
          transitionProperty: "width",
          width: "100%",
          "&.shifted-right": {
            width: `calc(100vw - ${theme.other.sidebarWidth}px)`,
          },
        })}
      >
        <Paper
          radius={0}
          sx={theme => ({
            borderRight: `1px solid ${theme.colors.gray[7]}`,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            // [theme.fn.smallerThan("md")]: { width: "100vw" },
            width: 420,
          })}
        >
          <Header />
          <RecipeList />
        </Paper>
        {/* RecipeDetails */}
        <Outlet context={recipes?.get(selectedRecipeId) ?? ({} as Recipe)} />
      </Paper>
      <CreateRecipeForm />
      <ImportRecipesForm />
    </Paper>
  );
}
