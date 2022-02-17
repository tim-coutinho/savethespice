import { ColorSchemeProvider, MantineProvider, Paper } from "@mantine/core";
import { useColorScheme, useLocalStorageValue } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { ReactElement, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { prefix, SignedInState, UNSET, View } from "../lib/common";
import { useRefreshIdToken, useRenderTimeout } from "../lib/hooks";
import { currentViewState, selectedRecipeIdState, signedInState } from "../store";

import AddForm from "./AddForm";
import AuthForm from "./AuthForm";
import DeleteForm from "./DeleteForm";
import Header from "./Header";
import ImportForm from "./ImportForm";
import Details from "./RecipeDetails";
import RecipeList from "./RecipeList";
import Sidebar from "./Sidebar";

export default function App(): ReactElement {
  const editMode = useRef(false);
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const [theme, setTheme] = useLocalStorageValue({
    key: `${prefix}theme`,
    defaultValue: useColorScheme(),
  });
  const [visible, rendered, setVisible] = useRenderTimeout();
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
  }, [signedIn, refreshIdTokenMutation.status]);

  useEffect(() => {
    localStorage.setItem(`${prefix}theme`, theme);
  }, [theme]);

  useEffect(() => {
    setVisible(true);
    refreshIdTokenMutation.mutate(undefined, {
      onSuccess: () => setSignedIn(SignedInState.SIGNED_IN),
      onError: () => setSignedIn(SignedInState.SIGNED_OUT),
    });
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={theme}
      toggleColorScheme={v => setTheme(v ?? theme === "dark" ? "light" : "dark")}
    >
      <MantineProvider
        theme={{
          headings: { fontWeight: 600 },
          primaryColor: "violet",
          fontFamily: "Roboto",
          colorScheme: theme,
          other: { buttonLength: 40, transitionDuration: 300, sidebarWidth: 250 },
        }}
        styles={{
          Image: theme => ({
            placeholder: {
              backgroundColor: theme.colorScheme === "light" ? theme.colors.gray[3] : undefined,
            },
          }),
        }}
      >
        <NotificationsProvider>
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
                  <Sidebar handleDeleteCategory={() => handleViewChange(View.DELETE)} />
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
                        // [`@media (max-width: ${theme.breakpoints.md}px)`]: { width: "100vw" },
                        width: 420,
                      })}
                    >
                      <Header handleViewChange={source => () => handleViewChange(source)} />
                      <RecipeList />
                    </Paper>
                    {selectedRecipeId !== UNSET && (
                      <Paper radius={0} sx={{ height: "100vh", flexGrow: 1 }}>
                        <Details
                          handleDeleteRecipe={() => handleViewChange(View.DELETE)}
                          editRecipe={() => handleViewChange(View.EDIT)}
                        />
                      </Paper>
                    )}
                  </Paper>
                </>
              )}
            </div>
            <AddForm editMode={editMode.current} />
            <DeleteForm />
            <ImportForm />
            <AuthForm />
          </Paper>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
