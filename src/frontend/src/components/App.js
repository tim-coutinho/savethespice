import { hot } from "react-hot-loader/root"; // Enable live component reloading
import React, { useEffect, useState } from "react";

import Database from "../backend/database";
import { CategoriesContext, RecipesContext, ViewContext } from "../lib/context";
import {
  Views,
  copyToClipboard,
  SignedInStates,
  useRenderTimeout,
  transitionDuration,
} from "../lib/common";
import { forgotPassword, refreshIdToken, signIn, signOut, signUp } from "../backend/operations";

// import ShoppingList from "./ShoppingList";
import AddForm from "./AddForm";
import DeleteForm from "./DeleteForm";
import Details from "./Details";
import Header from "./Header";
import ImportForm from "./ImportForm";
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
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [modalActive, setModalActive] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("All Recipes");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [signedIn, setSignedIn] = useState(SignedInStates.REFRESHING_ID_TOKEN);
  const [visible, rendered, setVisible] = useRenderTimeout();
  // const [shoppingList, setShoppingList] = useState([]);

  const handleViewChange = source => {
    setCurrentView(() => {
      switch (source) {
        case Views.DELETE_CATEGORY:
          return currentView === Views.DELETE_CATEGORY ? Views.HOME : Views.DELETE_CATEGORY;
        case Views.DELETE_RECIPE:
          return currentView === Views.DELETE_RECIPE ? Views.HOME : Views.DELETE_RECIPE;
        case Views.EDIT:
          setEditMode(true);
          return currentView === Views.ADD ? Views.HOME : Views.ADD;
        case Views.ADD:
          setEditMode(false);
          return currentView === Views.ADD ? Views.HOME : Views.ADD;
        case Views.SIDEBAR:
          return currentView === Views.HOME ? Views.SIDEBAR : Views.HOME;
        case Views.IMPORT:
          return currentView === Views.HOME ? Views.IMPORT : Views.HOME;
        default:
          return Views.HOME;
      }
    });
  };

  const handleAddCategory = category => {
    return database.addCategory(category);
  };

  const handleDeleteCategory = categoryId => {
    if (categoryId === null) {
      return;
    }
    return database
      .deleteCategory(categoryId)
      .then(() => categoryId === selectedCategoryId && setSelectedCategoryId("All Recipes"));
  };

  const handleAddRecipe = async values => {
    return database.addRecipe(values, editMode ? selectedRecipeId : null);
  };

  const handleDeleteRecipe = recipeId => {
    if (recipeId === null) {
      return;
    }
    return database
      .deleteRecipe(recipeId)
      .then(() => recipeId === selectedRecipeId && setSelectedRecipeId(null));
  };

  // const handleAddToShoppingList = ingredient => {
  //   setShoppingList(Array.from(new Set(shoppingList).add(ingredient)));
  // };
  //
  // const handleRemoveFromShoppingList = ingredient => {
  //   setShoppingList(shoppingList.filter(other => other !== ingredient));
  // };

  const handleRecipeListChange = newRecipes => {
    setAllRecipes({ ...newRecipes });
    setRecipesLoading(false);
  };

  const handleCategoryListChange = newCategories => {
    setCategories({ ...newCategories });
  };

  const handleFilterChange = ({ target }) => {
    setFilter(target.value);
  };

  const handleExport = () =>
    copyToClipboard(
      JSON.stringify(
        Object.values(allRecipes).map(recipe => {
          delete recipe.recipeId;
          delete recipe.createTime;
          delete recipe.updateTime;
          recipe.categories && (recipe.categories = recipe.categories.map(c => categories[c].name));
          return recipe;
        })
      )
    );

  const handleImport = async importString => {
    const recipes = JSON.parse(importString);
    await database.addRecipes(recipes);
    handleViewChange(Views.IMPORT);
  };

  useEffect(() => {
    if (signedIn === SignedInStates.REFRESHING_ID_TOKEN) {
      return;
    }
    if (signedIn !== SignedInStates.SIGNED_IN) {
      setVisible(false);
      setCurrentView(Views.SIGN_IN);
      setDatabase(null);
    } else {
      setVisible(true);
      setCurrentView(Views.HOME);
    }
  }, [signedIn]);

  useEffect(() => {
    if (rendered) {
      return;
    }
    setAllRecipes({});
    setCategories({});
  }, [rendered]);

  useEffect(() => {
    setModalActive(!!currentView.modal);
  }, [currentView]);

  useEffect(() => {
    setFilteredRecipes(
      Object.entries(allRecipes)
        .filter(
          ([, recipe]) =>
            recipe.name.toLowerCase().includes(filter.toLowerCase()) &&
            (selectedCategoryId === "All Recipes" ||
              recipe.categories?.includes(+selectedCategoryId))
        )
        .sort(([, { createTime: time1 }], [, { createTime: time2 }]) => (time1 <= time2 ? 1 : -1))
    );
  }, [filter, allRecipes, selectedCategoryId]);

  useEffect(() => {
    refreshIdToken()
      .then(user => {
        if (!user) {
          setSignedIn(SignedInStates.SIGNED_OUT);
          return;
        }
        setRecipesLoading(true);
        setSignedIn(SignedInStates.SIGNED_IN);
        setDatabase(new Database(user, handleRecipeListChange, handleCategoryListChange));
      })
      .catch(() => setSignedIn(SignedInStates.SIGNED_OUT));
  }, []);

  return (
    <div id="app">
      <RecipesContext.Provider
        value={{
          recipesLoading,
          recipes: filteredRecipes,
          selectedRecipeId,
          setSelectedRecipeId,
        }}
      >
        <CategoriesContext.Provider
          value={{
            categories,
            selectedCategoryId,
            setSelectedCategoryId,
          }}
        >
          <ViewContext.Provider value={{ currentView, setCurrentView }}>
            <div
              id="non-modals"
              className={visible ? "visible" : ""}
              style={{ transitionDuration: `${transitionDuration}ms` }}
            >
              {rendered && (
                <>
                  <Sidebar
                    classes={modalActive ? "disabled" : ""}
                    handleAddCategory={handleAddCategory}
                    handleExport={handleExport}
                    handleImport={() => setCurrentView(Views.IMPORT)}
                    handleSignOut={() =>
                      signOut().then(() => setSignedIn(SignedInStates.SIGNED_OUT))
                    }
                    handleDeleteCategory={() => handleViewChange(Views.DELETE_CATEGORY)}
                  />
                  <div
                    id="main-content"
                    className={
                      currentView === Views.SIDEBAR
                        ? "shifted-right"
                        : modalActive
                        ? "disabled"
                        : ""
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
                          handleDeleteRecipe={() => handleViewChange(Views.DELETE_RECIPE)}
                          editRecipe={() => handleViewChange(Views.EDIT)}
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
              <AddForm
                handleAddRecipe={handleAddRecipe}
                initialValues={editMode ? allRecipes[selectedRecipeId] : {}}
              />
              <DeleteForm
                handleDelete={
                  currentView === Views.DELETE_RECIPE ? handleDeleteRecipe : handleDeleteCategory
                }
              />
              <ImportForm handleImport={handleImport} />
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
                      setDatabase(
                        new Database(user, handleRecipeListChange, handleCategoryListChange)
                      );
                      setSignedIn(SignedInStates.SIGNED_IN);
                    })
                    .catch(e => {
                      setSignedIn(SignedInStates.SIGNED_OUT);
                      throw e;
                    });
                }}
                handleSignUp={(email, password) => {
                  setSignedIn(SignedInStates.PENDING);
                  return signUp(email, password)
                    .then(res => {
                      setSignedIn(SignedInStates.SIGNED_OUT);
                      return res;
                    })
                    .catch(e => {
                      setSignedIn(SignedInStates.SIGNED_OUT);
                      throw e;
                    });
                }}
                handleForgotPassword={email => {
                  setSignedIn(SignedInStates.PENDING);
                  return forgotPassword(email)
                    .then(res => {
                      setSignedIn(SignedInStates.SIGNED_OUT);
                      return res;
                    })
                    .catch(e => {
                      setSignedIn(SignedInStates.SIGNED_OUT);
                      throw e;
                    });
                }}
                pending={signedIn === SignedInStates.PENDING}
              />
            </div>
          </ViewContext.Provider>
        </CategoriesContext.Provider>
      </RecipesContext.Provider>
    </div>
  );
});
