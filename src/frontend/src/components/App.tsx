import { ColorSchemeProvider, MantineProvider, Paper } from "@mantine/core";
import { useColorScheme, useLocalStorageValue } from "@mantine/hooks";
import { ReactElement, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { prefix, SignedInState, UNSET, View } from "../lib/common";
import { useRenderTimeout } from "../lib/hooks";
import { refreshIdToken } from "../lib/operations";
import {
  allRecipesState,
  categoriesState,
  currentViewState,
  modalActiveState,
  selectedRecipeIdState,
  signedInState,
} from "../store";

import AddForm from "./AddForm";
// import ShoppingList from "./ShoppingList";
import "./App.scss";
import AuthForm from "./AuthForm";
import DeleteForm from "./DeleteForm";
import Details from "./Details";
import Header from "./Header";
import ImportForm from "./ImportForm";
import RecipeList from "./RecipeList";
import Sidebar from "./Sidebar";

export default (): ReactElement => {
  const editMode = useRef(false);
  // const [shoppingList, setShoppingList] = useState([]);
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const modalActive = useRecoilValue(modalActiveState);
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const [theme, setTheme] = useLocalStorageValue({
    key: `${prefix}theme`,
    defaultValue: useColorScheme(),
  });
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const setAllCategories = useSetRecoilState(categoriesState);
  const [visible, rendered, setVisible] = useRenderTimeout();

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

  // const handleAddToShoppingList = ingredient => {
  //   setShoppingList(Array.from(new Set(shoppingList).add(ingredient)));
  // };
  //
  // const handleRemoveFromShoppingList = ingredient => {
  //   setShoppingList(shoppingList.filter(other => other !== ingredient));
  // };

  useEffect(() => {
    if (signedIn === SignedInState.REFRESHING_ID_TOKEN) {
      return;
    }
    if (signedIn !== SignedInState.SIGNED_IN) {
      setVisible(false);
      setCurrentView(View.AUTH);
    } else {
      setVisible(true);
      setCurrentView(View.HOME);
    }
  }, [signedIn]);

  useEffect(() => {
    if (rendered) {
      return;
    }
    setAllRecipes(new Map());
    setAllCategories(new Map());
  }, [rendered]);

  useEffect(() => {
    localStorage.setItem(`${prefix}theme`, theme);
  }, [theme]);

  useEffect(() => {
    setVisible(true);
    refreshIdToken()
      .then(userId => {
        if (!userId) {
          setVisible(false);
          setSignedIn(SignedInState.SIGNED_OUT);
          return;
        }
        setSignedIn(SignedInState.SIGNED_IN);
      })
      .catch(() => {
        setVisible(false);
        setSignedIn(SignedInState.SIGNED_OUT);
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
          other: { buttonLength: 40, transitionDuration: 300 },
        }}
        styles={{
          Image: theme => ({
            placeholder: {
              backgroundColor: theme.colorScheme === "light" ? theme.colors.gray[3] : undefined,
            },
          }),
        }}
      >
        <Paper
          id="app"
          sx={theme => ({
            "&[data-themechange], &[data-themechange] *": {
              transition: `${theme.other.transitionDuration}ms !important`,
            },
          })}
        >
          <div id="non-modals" className={visible ? "visible" : ""}>
            {rendered && (
              <>
                <Sidebar handleDeleteCategory={() => handleViewChange(View.DELETE)} />
                <Paper
                  id="main-content"
                  className={
                    currentView === View.SIDEBAR ? "shifted-right" : modalActive ? "disabled" : ""
                  }
                >
                  <Paper id="left" radius={0}>
                    <Header handleViewChange={source => () => handleViewChange(source)} />
                    <RecipeList />
                  </Paper>
                  {selectedRecipeId !== UNSET && (
                    <Paper radius={0} sx={{ height: "100vh", flexGrow: 1 }}>
                      <Details
                        handleDeleteRecipe={() => handleViewChange(View.DELETE)}
                        editRecipe={() => handleViewChange(View.EDIT)}
                        // shoppingList={shoppingList}
                        // handleAddToShoppingList={handleAddToShoppingList}
                        // handleRemoveFromShoppingList={handleRemoveFromShoppingList}
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
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
