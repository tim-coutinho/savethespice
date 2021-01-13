import { hot } from "react-hot-loader/root"; // Enable live component reloading
import React, { useEffect, useState } from "react";

import Database from "../backend/database";
import { login, signOut } from "../backend/auth";

import AddForm from "./AddForm";
import DeleteForm from "./DeleteForm";
import Details from "./Details";
import Header from "./Header";
import RecipeList from "./RecipeList";
// import ShoppingList from "./ShoppingList";
import Sidebar from "./Sidebar";

import "./App.scss";

function App() {
  const [categories, setCategories] = useState([]);
  const [currentView, setCurrentView] = useState("Home");
  const [database, setDatabase] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState("All Recipes");
  const [shoppingList, setShoppingList] = useState([]);
  const [user, setUser] = useState("");

  const handleViewChange = source => {
    setCurrentView(() => {
      switch (source) {
        case "Delete":
          return currentView === "Delete" ? "Home" : "Delete";
        case "Edit":
          setEditMode(true);
          return currentView === "Add" ? "Home" : "Add";
        case "Add":
          setEditMode(false);
          return currentView === "Add" ? "Home" : "Add";
        case "Sidebar":
          return currentView === "Home" ? "Sidebar" : "Home";
        default:
          return "Home";
      }
    });
  };

  const handleAddCategory = category => {
    database?.addCategory(category);
  };

  const handleAddRecipe = values => {
    values && database.addRecipe(values, user, editMode && selectedRecipe);
    handleViewChange("Add");
  };

  const handleDeleteRecipe = confirm => {
    confirm && database.removeRecipe(selectedRecipe, user).then(() => setSelectedRecipe(null));
    handleViewChange("Delete");
  };

  const handleAddToShoppingList = ingredient => {
    setShoppingList(Array.from(new Set(shoppingList).add(ingredient)));
  };

  const handleRemoveFromShoppingList = ingredient => {
    setShoppingList(shoppingList.filter(other => other !== ingredient));
  };

  const handleRecipeListChange = snapshot => {
    if (snapshot.val() === null) {
      return;
    }
    setRecipes(snapshot.val());
    setIsLoading(false);
  };

  const handleCategoryListChange = snapshot => {
    if (snapshot.val() === null) {
      return;
    }
    setCategories(["All Recipes", ...Object.keys(snapshot.val())]);
  };

  const handleFilterChange = ({ target }) => {
    setFilter(target.value);
  };

  const handleImport = () => {};

  const handleExport = () => {
    console.log(recipes);
  };

  useEffect(() => {
    setFilteredRecipes(
      Object.entries(recipes)
        .filter(([, item]) => item.name.toLowerCase().includes(filter.toLowerCase()))
        .reverse()
    );
  }, [filter, recipes]);

  useEffect(() => {
    if (!user) {
      login(setUser);
    }
    setDatabase(new Database(user, handleRecipeListChange, handleCategoryListChange));
  }, [user]);

  return (
    <div id="app">
      <Sidebar
        categories={categories}
        changeSelectedItem={setSelectedSidebarItem}
        classes={currentView === "Add" || currentView === "Delete" ? "disabled" : ""}
        handleAddCategory={category => handleAddCategory(category)}
        handleExport={handleExport}
        handleImport={handleImport}
        handleSignOut={() => signOut(setUser)}
        selectedItem={selectedSidebarItem}
      />
      <div
        id="main-content"
        className={`${
          currentView === "Sidebar"
            ? "shifted-right"
            : currentView === "Add" || currentView === "Delete"
            ? "disabled"
            : ""
        }`}
      >
        <div id="left">
          <Header
            filter={filter}
            category={selectedSidebarItem}
            shiftedRight={currentView === "Sidebar"}
            handleFilterChange={handleFilterChange}
            handleViewChange={source => () => handleViewChange(source)}
          />
          <RecipeList
            recipes={isLoading ? null : filteredRecipes}
            changeSelectedRecipe={id => setSelectedRecipe(id)}
            selectedCategory={selectedSidebarItem}
            selectedRecipe={selectedRecipe}
          />
        </div>
        <div id="right">
          {/*<ShoppingList shoppingList={shoppingList}/>*/}
          {selectedRecipe && (
            <Details
              recipe={recipes[selectedRecipe]}
              handleDeleteRecipe={() => handleViewChange("Delete")}
              editRecipe={() => handleViewChange("Edit")}
              shoppingList={shoppingList}
              handleAddToShoppingList={handleAddToShoppingList}
              handleRemoveFromShoppingList={handleRemoveFromShoppingList}
            />
          )}
        </div>
      </div>
      <div id="modals">
        {currentView === "Add" && (
          <AddForm
            handleAddRecipe={handleAddRecipe}
            visible={currentView === "Add"}
            initialValues={editMode ? recipes[selectedRecipe] : {}}
          />
        )}
        <DeleteForm handleDeleteRecipe={handleDeleteRecipe} visible={currentView === "Delete"} />
      </div>
    </div>
  );
}

export default hot(App);
