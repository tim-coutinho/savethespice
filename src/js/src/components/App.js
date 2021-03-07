import { hot } from "react-hot-loader/root"; // Enable live component reloading
import React, { useEffect, useState } from "react";

import Database from "../backend/database";
import { ImportContext, RecipesContext, ViewContext } from "../lib/context";
import { Views, copyToClipboard, SignedInStates } from "../lib/common";
import { refreshIdToken, signIn, signOut, signUp } from "../backend/operations";

// import ShoppingList from "./ShoppingList";
import AddForm from "./AddForm";
import DeleteForm from "./DeleteForm";
import Details from "./Details";
import Header from "./Header";
import ImportForm from "./ImportForm";
import Modal from "./Modal";
import RecipeList from "./RecipeList";
import Sidebar from "./Sidebar";

import "./App.scss";
import SignInForm from "./SignInForm";

export default hot(() => {
  const [allRecipes, setAllRecipes] = useState({});
  const [categories, setCategories] = useState({});
  const [currentView, setCurrentView] = useState(Views.HOME);
  const [database, setDatabase] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [importString, setImportString] = useState("");
  const [importValid, setImportValid] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalActive, setModalActive] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("All Recipes");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);
  const [signedIn, setSignedIn] = useState(SignedInStates.REFRESHING_ID_TOKEN);

  const handleViewChange = source => {
    setCurrentView(() => {
      switch (source) {
        case Views.DELETE:
          return currentView === Views.DELETE ? Views.HOME : Views.DELETE;
        case Views.EDIT:
          setEditMode(true);
          return currentView === Views.ADD ? Views.HOME : Views.ADD;
        case Views.ADD:
          setEditMode(false);
          return currentView === Views.ADD ? Views.HOME : Views.ADD;
        case Views.SIDEBAR:
          return currentView === Views.HOME ? Views.SIDEBAR : Views.HOME;
        default:
          return Views.HOME;
      }
    });
  };

  const handleAddCategory = category => {
    database.addCategory(category);
  };

  const handleAddRecipe = values => {
    values && database.addRecipe(values, editMode ? selectedRecipeId : null);
    handleViewChange(Views.ADD);
  };

  const handleDeleteRecipe = confirm => {
    if (!confirm) {
      setCurrentView(Views.HOME);
      return;
    }
    database.deleteRecipe(selectedRecipeId);
    setSelectedRecipeId(null);
    handleViewChange(Views.DELETE);
  };

  const handleAddToShoppingList = ingredient => {
    setShoppingList(Array.from(new Set(shoppingList).add(ingredient)));
  };

  const handleRemoveFromShoppingList = ingredient => {
    setShoppingList(shoppingList.filter(other => other !== ingredient));
  };

  const handleRecipeListChange = newRecipes => {
    setAllRecipes({ ...newRecipes });
    setIsLoading(false);
  };

  const handleCategoryListChange = newCategories => {
    setCategories({ ...newCategories });
  };

  const handleFilterChange = ({ target }) => {
    setFilter(target.value);
  };

  const handleExport = () => copyToClipboard(JSON.stringify(Object.values(allRecipes)));

  const handleImport = () => {
    handleViewChange(Views.SIDEBAR);
    setImportVisible(true);
  };

  useEffect(() => {
    if (signedIn !== SignedInStates.SIGNED_IN) {
      setCurrentView(Views.HOME);
      setIsLoading(true);
      setDatabase(null);
    }
  }, [signedIn]);

  useEffect(() => {
    if (database) {
      return;
    }
    setAllRecipes({});
    setCategories({});
  }, [database]);

  useEffect(() => {
    setModalActive(currentView === Views.DELETE || currentView === Views.ADD || importVisible);
  }, [currentView, importVisible]);

  useEffect(() => {
    setFilteredRecipes(
      (selectedCategoryId === "All Recipes"
        ? Object.entries(allRecipes)
        : Object.entries(allRecipes).filter(
            ([, recipe]) =>
              recipe.name.toLowerCase().includes(filter.toLowerCase()) &&
              recipe.categories.includes(+selectedCategoryId)
          )
      ).sort(([, { originalSubmitTime: time1 }], [, { originalSubmitTime: time2 }]) =>
        time1 <= time2 ? 1 : -1
      )
    );
  }, [filter, allRecipes, selectedCategoryId]);

  useEffect(() => {
    refreshIdToken()
      .then(user => {
        if (!user) {
          setSignedIn(SignedInStates.SIGNED_OUT);
          return;
        }
        setDatabase(new Database(user, handleRecipeListChange, handleCategoryListChange));
        setSignedIn(SignedInStates.SIGNED_IN);
      })
      .catch(() => setSignedIn(SignedInStates.SIGNED_OUT));
  }, []);

  return signedIn === SignedInStates.REFRESHING_ID_TOKEN ? (
    <div />
  ) : signedIn === SignedInStates.SIGNED_OUT ? (
    <div id="app">
      <SignInForm
        handleSignIn={(email, password) => {
          setSignedIn(SignedInStates.PENDING);
          return signIn(email, password)
            .then(user => {
              if (!user) {
                setSignedIn(SignedInStates.SIGNED_OUT);
                setDatabase(null);
                return;
              }
              setDatabase(new Database(user, handleRecipeListChange, handleCategoryListChange));
              setSignedIn(SignedInStates.SIGNED_IN);
            })
            .catch(() => setSignedIn(SignedInStates.SIGNED_OUT));
        }}
        handleSignUp={(email, password) => signUp(email, password)}
        pending={signedIn === SignedInStates.PENDING}
      />
    </div>
  ) : (
    <div id="app">
      <RecipesContext.Provider
        value={{
          isLoading,
          recipes: filteredRecipes,
          selectedRecipeId,
          setSelectedRecipeId,
        }}
      >
        <ViewContext.Provider value={currentView}>
          <Sidebar
            categories={categories}
            changeSelectedCategoryId={categoryId => {
              setSelectedCategoryId(categoryId);
              // handleViewChange(Views.SIDEBAR);
            }}
            classes={modalActive ? "disabled" : ""}
            handleAddCategory={handleAddCategory}
            handleExport={handleExport}
            handleImport={handleImport}
            handleSignOut={() => signOut().then(() => setSignedIn(SignedInStates.SIGNED_OUT))}
            selectedCategoryId={selectedCategoryId}
          />
          <div
            id="main-content"
            className={
              currentView === Views.SIDEBAR ? "shifted-right" : modalActive ? "disabled" : ""
            }
          >
            <div id="left">
              <Header
                filter={filter}
                category={categories[selectedCategoryId]?.name ?? "All Recipes"}
                handleFilterChange={handleFilterChange}
                handleViewChange={source => () => handleViewChange(source)}
              />
              <RecipeList />
            </div>
            <div id="right">
              {selectedRecipeId && (
                <Details
                  handleDeleteRecipe={() => handleViewChange(Views.DELETE)}
                  editRecipe={() => handleViewChange(Views.EDIT)}
                  shoppingList={shoppingList}
                  handleAddToShoppingList={handleAddToShoppingList}
                  handleRemoveFromShoppingList={handleRemoveFromShoppingList}
                />
              )}
            </div>
          </div>
          <div id="modals">
            <AddForm
              handleAddRecipe={handleAddRecipe}
              initialValues={editMode ? allRecipes[selectedRecipeId] : {}}
            />
            <DeleteForm handleDeleteRecipe={handleDeleteRecipe} />
            <ImportContext.Provider
              value={{
                importString,
                setImportString,
                importValid,
                setImportValid,
                importVisible,
                setImportVisible,
              }}
            >
              <Modal
                handleModalCancel={() => setImportVisible(false)}
                handleModalSubmit={() => {
                  const recipes = JSON.parse(importString);
                  recipes.forEach(recipe => database.addRecipe(recipe));
                  setImportVisible(false);
                }}
                modalCancelText="Cancel"
                modalSubmitText="Import"
                title="Paste JSON:"
                valid={importValid}
                visible={importVisible}
              >
                <ImportForm handleAddRecipe={recipe => database.addRecipe(recipe)} />
              </Modal>
            </ImportContext.Provider>
          </div>
        </ViewContext.Provider>
      </RecipesContext.Provider>
    </div>
  );
});
