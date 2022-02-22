import { Paper, useMantineTheme } from "@mantine/core";
import { ReactElement, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";

import { Header, Sidebar } from "@/components/Layout";
import { AuthForm, useRefreshIdToken } from "@/features/auth";
import { AddRecipeForm, ImportRecipesForm, RecipeDetails, RecipeList } from "@/features/recipes";
import { useRenderTimeout } from "@/hooks";
import { currentViewState, signedInState } from "@/stores";
import { prefix, SignedInState, View } from "@/utils/common";

export default function App(): ReactElement {
  const editMode = useRef(false);
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const [visible, rendered, setVisible] = useRenderTimeout();
  const theme = useMantineTheme();

  const refreshIdTokenMutation = useRefreshIdToken();

  const handleViewChange = (source: typeof View[keyof typeof View]): void =>
    setCurrentView(() => {
      switch (source) {
        case View.DELETE:
          return currentView === View.DELETE ? View.HOME : View.DELETE;
        case View.EDIT:
          editMode.current = true;
          return currentView === View.ADD ? View.HOME : View.ADD;
        case View.ADD:
          editMode.current = false;
          return currentView === View.ADD ? View.HOME : View.ADD;
        case View.SIDEBAR:
          return currentView === View.HOME ? View.SIDEBAR : View.HOME;
        case View.IMPORT:
          return currentView === View.HOME ? View.IMPORT : View.HOME;
        default:
          return View.HOME;
      }
    });

  useEffect(() => {
    if (refreshIdTokenMutation.isLoading) {
      return;
    }
    if (signedIn !== SignedInState.SIGNED_IN) {
      setVisible(false);
      setCurrentView(View.AUTH);
    } else {
      setVisible(true);
      setCurrentView(View.HOME);
    }
  }, [signedIn, refreshIdTokenMutation.isLoading]);

  useEffect(() => {
    localStorage.setItem(`${prefix}theme`, theme.colorScheme);
  }, [theme.colorScheme]);

  useEffect(() => {
    setVisible(true);
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
      <div className={visible ? "visible" : ""}>
        {rendered && (
          <>
            <Sidebar />
            <Paper
              className={currentView === View.SIDEBAR ? "shifted-right" : ""}
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
                <Header handleViewChange={source => () => handleViewChange(source)} />
                <RecipeList />
              </Paper>
              <Paper radius={0} sx={{ height: "100vh", flexGrow: 1 }}>
                <RecipeDetails editRecipe={() => handleViewChange(View.EDIT)} />
              </Paper>
            </Paper>
          </>
        )}
      </div>
      <AddRecipeForm editMode={editMode.current} />
      <ImportRecipesForm />
      <AuthForm />
    </Paper>
  );
}
