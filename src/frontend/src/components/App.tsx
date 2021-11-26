import { ReactElement, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { refreshIdToken } from "../lib/operations";
import { SignedInState, Theme, transitionDuration, UNSET, View } from "../lib/common";
import {
  allRecipesState,
  categoriesState,
  currentViewState,
  modalActiveState,
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
import RecipeList from "./RecipeList";
import Sidebar from "./Sidebar";
import SignInForm from "./SignInForm";
import { useRenderTimeout } from "../lib/hooks";

export default (): ReactElement => {
  const [editMode, setEditMode] = useState(false);
  // const [shoppingList, setShoppingList] = useState([]);
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const modalActive = useRecoilValue(modalActiveState);
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const theme = useRecoilValue(themeState);
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const setAllCategories = useSetRecoilState(categoriesState);
  const [visible, rendered, setVisible] = useRenderTimeout();

  const handleViewChange = (source: typeof View[keyof typeof View]): void =>
    setCurrentView(() => {
      switch (source) {
        case View.DELETE:
          return currentView === View.DELETE ? View.HOME : View.DELETE;
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
    setAllCategories(new Map());
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
        setSignedIn(SignedInState.SIGNED_IN);
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
            <Sidebar handleDeleteCategory={() => handleViewChange(View.DELETE)} />
            <div
              id="main-content"
              className={
                currentView === View.SIDEBAR ? "shifted-right" : modalActive ? "disabled" : ""
              }
            >
              <div id="left">
                <Header handleViewChange={source => () => handleViewChange(source)} />
                <RecipeList />
              </div>
              <div id="right">
                {selectedRecipeId !== UNSET && (
                  <Details
                    handleDeleteRecipe={() => handleViewChange(View.DELETE)}
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
        <ImportForm />
        <SignInForm />
      </div>
    </div>
  );
};
