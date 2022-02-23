import { Paper, useMantineTheme } from "@mantine/core";
import { ReactElement, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";

import { Header, Sidebar } from "@/components/Layout";
import { useRefreshIdToken } from "@/features/auth";
import { CreateRecipeForm, ImportRecipesForm, RecipeList } from "@/features/recipes";
import { currentViewState, sidebarOpenedState, signedInState } from "@/stores";
import { prefix, SignedInState, View } from "@/utils/common";

export default function App(): ReactElement {
  const [, setCurrentView] = useRecoilState(currentViewState);
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const sidebarOpened = useRecoilValue(sidebarOpenedState);
  const theme = useMantineTheme();

  const refreshIdTokenMutation = useRefreshIdToken();

  useEffect(() => {
    !refreshIdTokenMutation.isLoading &&
      setCurrentView(signedIn !== SignedInState.SIGNED_IN ? View.AUTH : View.HOME);
  }, [signedIn, refreshIdTokenMutation.isLoading]);

  useEffect(() => {
    localStorage.setItem(`${prefix}theme`, theme.colorScheme);
  }, [theme.colorScheme]);

  useEffect(() => {
    refreshIdTokenMutation.mutate(undefined, {
      onSuccess: () => setSignedIn(SignedInState.SIGNED_IN),
      onError: () => setSignedIn(SignedInState.SIGNED_OUT),
    });
  }, []);

  return (
    <Paper
      id="app"
      sx={theme => ({
        "&[data-themechange], &[data-themechange] *": {
          transition: `${theme.other.transitionDuration}ms !important`,
        },
      })}
    >
      <Sidebar />
      <Paper
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
        <Outlet /> {/* RecipeDetails */}
      </Paper>
      <CreateRecipeForm />
      <ImportRecipesForm />
    </Paper>
  );
}
