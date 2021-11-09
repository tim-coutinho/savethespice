import { ReactElement, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import {
  addRecipes,
  getAllCategories,
  getAllRecipes,
  refreshIdToken,
  signIn,
} from "../lib/operations";
import {
  SignedInState,
  Theme,
  transitionDuration,
  UNSET,
  useRenderTimeout,
  View,
} from "../lib/common";
import {
  allRecipesState,
  categoriesState,
  currentViewState,
  modalActiveState,
  recipesLoadingState,
  selectedRecipeIdState,
  signedInState,
  themeState,
} from "../store";

// import ShoppingList from "./ShoppingList";
import AddForm from "./AddForm";

import "./App.scss";
import DeleteForm from "./DeleteForm";
import Details from "./Details";
import Header from "./Header";
import ImportForm from "./ImportForm";
import SidebarRecipeList from "./SidebarRecipeList";
import Sidebar from "./Sidebar";
import SignInForm from "./SignInForm";

export default (): ReactElement => {
  const [editMode, setEditMode] = useState(false);
  // const [shoppingList, setShoppingList] = useState([]);
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const modalActive = useRecoilValue(modalActiveState);
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const theme = useRecoilValue(themeState);
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const setCategories = useSetRecoilState(categoriesState);
  const setRecipesLoading = useSetRecoilState(recipesLoadingState);
  const [visible, rendered, setVisible] = useRenderTimeout();

  const handleViewChange = (source: typeof View[keyof typeof View]): void =>
    setCurrentView(() => {
      switch (source) {
        case View.DELETE_CATEGORY:
          return currentView === View.DELETE_CATEGORY ? View.HOME : View.DELETE_CATEGORY;
        case View.DELETE_RECIPE:
          return currentView === View.DELETE_RECIPE ? View.HOME : View.DELETE_RECIPE;
        case View.EDIT:
          setEditMode(true);
          return currentView === View.ADD ? View.HOME : View.ADD;
        case View.ADD:
          setEditMode(false);
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

  const handleImport = async (importString: string): Promise<void> => {
    const recipes = JSON.parse(importString);
    await addRecipes(recipes);
    handleViewChange(View.IMPORT);
  };

  const getAllRecipesAndCategories = () => {
    getAllRecipes()
      .then(({ recipes }) => {
        setAllRecipes(new Map(recipes.map(r => [r.recipeId, r])));
      })
      .then(() => setRecipesLoading(false));
    getAllCategories().then(({ categories }) => {
      setCategories(new Map(categories.map(c => [c.categoryId, c])));
    });
  };

  useEffect(() => {
    if (signedIn === SignedInState.REFRESHING_ID_TOKEN) {
      return;
    }
    if (signedIn !== SignedInState.SIGNED_IN) {
      setVisible(false);
      setCurrentView(View.SIGN_IN);
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
    setCategories(new Map());
  }, [rendered]);

  useEffect(() => {
    Theme.setting = theme;
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
        setRecipesLoading(true);
        setSignedIn(SignedInState.SIGNED_IN);
        getAllRecipesAndCategories();
      })
      .catch(() => {
        setVisible(false);
        setSignedIn(SignedInState.SIGNED_OUT);
      });
  }, []);

  return (
    <div id="app">
      <div
        id="non-modals"
        className={visible ? "visible" : ""}
        style={{ transitionDuration: `${transitionDuration}ms` }}
      >
        {rendered && (
          <>
            <Sidebar handleDeleteCategory={() => handleViewChange(View.DELETE_CATEGORY)} />
            <div
              id="main-content"
              className={
                currentView === View.SIDEBAR ? "shifted-right" : modalActive ? "disabled" : ""
              }
            >
              <div id="left">
                <Header handleViewChange={source => () => handleViewChange(source)} />
                <SidebarRecipeList />
              </div>
              <div id="right">
                {selectedRecipeId !== UNSET && (
                  <Details
                    handleDeleteRecipe={() => handleViewChange(View.DELETE_RECIPE)}
                    editRecipe={() => handleViewChange(View.EDIT)}
                    // shoppingList={shoppingList}
                    // handleAddToShoppingList={handleAddToShoppingList}
                    // handleRemoveFromShoppingList={handleRemoveFromShoppingList}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div id="modals">
        <AddForm editMode={editMode} />
        <DeleteForm />
        <ImportForm handleImport={handleImport} />
        <SignInForm
          handleSignIn={(email, password) => {
            setSignedIn(SignedInState.PENDING);
            return signIn(email, password)
              .then(userId => {
                if (!userId) {
                  setSignedIn(SignedInState.SIGNED_OUT);
                  return "";
                }
                getAllRecipesAndCategories();
                setSignedIn(SignedInState.SIGNED_IN);
                return userId;
              })
              .catch(e => {
                setSignedIn(SignedInState.SIGNED_OUT);
                throw e;
              });
          }}
        />
      </div>
    </div>
  );
};
