import { hot } from "react-hot-loader/root"; // Enable live component reloading
import React, { useEffect, useState } from "react";

import Database from "../backend/database";
import { CategoriesContext, RecipesContext, ViewContext } from "../lib/context";
import { Views, copyToClipboard, SignedInStates } from "../lib/common";
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
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);
  const [currentView, setCurrentView] = useState(Views.HOME);
  const [database, setDatabase] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalActive, setModalActive] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("All Recipes");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [signedIn, setSignedIn] = useState(SignedInStates.REFRESHING_ID_TOKEN);
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

  const handleDeleteCategory = () => {
    if (!categoryIdToDelete) {
      return;
    }
    return database.deleteCategory(categoryIdToDelete).then(() => {
      categoryIdToDelete === selectedCategoryId && setSelectedCategoryId("All Recipes");
      setCategoryIdToDelete(null);
    });
  };

  const handleAddRecipe = async values => {
    return database.addRecipe(values, editMode ? selectedRecipeId : null);
  };

  const handleDeleteRecipe = () => {
    return database.deleteRecipe(selectedRecipeId).then(() => setSelectedRecipeId(null));
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
    setIsLoading(false);
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
        Object.values(allRecipes).map(r => {
          delete r.recipeId;
          delete r.createTime;
          delete r.updateTime;
          r.categories && (r.categories = r.categories.map(c => categories[c].name));
          return r;
        })
      )
    );

  const handleImport = async importString => {
    const recipes = JSON.parse(importString);
    await database.addRecipes(recipes);
    handleViewChange(Views.IMPORT);
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
    setModalActive(
      [Views.DELETE_RECIPE, Views.DELETE_CATEGORY, Views.ADD, Views.IMPORT].includes(currentView)
    );
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
        setDatabase(new Database(user, handleRecipeListChange, handleCategoryListChange));
        setSignedIn(SignedInStates.SIGNED_IN);
      })
      .catch(() => setSignedIn(SignedInStates.SIGNED_OUT));
  }, []);

  return signedIn === SignedInStates.REFRESHING_ID_TOKEN ? (
    <div />
  ) : signedIn === SignedInStates.SIGNED_OUT || signedIn === SignedInStates.PENDING ? (
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
        <CategoriesContext.Provider
          value={{
            categories,
            selectedCategoryId,
            setSelectedCategoryId,
            categoryIdToDelete,
            setCategoryIdToDelete,
          }}
        >
          <ViewContext.Provider value={{ currentView, setCurrentView }}>
            <Sidebar
              classes={modalActive ? "disabled" : ""}
              handleAddCategory={handleAddCategory}
              handleExport={handleExport}
              handleImport={() => setCurrentView(Views.IMPORT)}
              handleSignOut={() => signOut().then(() => setSignedIn(SignedInStates.SIGNED_OUT))}
              handleDeleteCategory={() => handleViewChange(Views.DELETE_CATEGORY)}
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
                    handleDeleteRecipe={() => handleViewChange(Views.DELETE_RECIPE)}
                    editRecipe={() => handleViewChange(Views.EDIT)}
                    // shoppingList={shoppingList}
                    // handleAddToShoppingList={handleAddToShoppingList}
                    // handleRemoveFromShoppingList={handleRemoveFromShoppingList}
                  />
                )}
              </div>
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
            </div>
          </ViewContext.Provider>
        </CategoriesContext.Provider>
      </RecipesContext.Provider>
    </div>
  );
});
