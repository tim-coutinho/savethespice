import { hot } from "react-hot-loader/root"; // Enable live component reloading
import React, { useEffect, useState } from "react";

import Database from "../backend/database";
import { copyToClipboard, prefix } from "../utils/common";
import { login, signOut } from "../backend/auth";

import AddForm from "./AddForm";
import DeleteForm from "./DeleteForm";
import Details from "./Details";
import Header from "./Header";
import Modal from "./Modal";
import ImportForm from "./ImportForm";
import RecipeList from "./RecipeList";
// import ShoppingList from "./ShoppingList";
import Sidebar from "./Sidebar";

import "./App.scss";

export default hot(() => {
  const [categories, setCategories] = useState([]);
  const [currentView, setCurrentView] = useState("Home");
  const [database, setDatabase] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [importValid, setImportValid] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalActive, setModalActive] = useState(false);
  const [recipes, setRecipes] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState("All Recipes");
  const [shoppingList, setShoppingList] = useState([]);
  const [user, setUser] = useState(null);
  const [importString, setImportString] = useState("");

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
    database.addCategory(category);
  };

  const handleAddRecipe = values => {
    values && database.addRecipe(values, editMode ? selectedRecipe : null);
    handleViewChange("Add");
  };

  const handleDeleteRecipe = confirm => {
    if (!confirm) {
      setCurrentView("Home");
      return;
    }
    database.removeRecipe(selectedRecipe);
    setSelectedRecipe(null);
    handleViewChange("Delete");
  };

  const handleAddToShoppingList = ingredient => {
    setShoppingList(Array.from(new Set(shoppingList).add(ingredient)));
  };

  const handleRemoveFromShoppingList = ingredient => {
    setShoppingList(shoppingList.filter(other => other !== ingredient));
  };

  const handleRecipeListChange = recipes => {
    setRecipes(recipes);
    setIsLoading(false);
  };

  const handleCategoryListChange = categories => {
    setCategories(["All Recipes", ...Object.keys(categories)]);
  };

  const handleFilterChange = ({ target }) => {
    setFilter(target.value);
  };

  const handleExport = () => copyToClipboard(JSON.stringify(Object.values(recipes)));

  const handleImport = () => {
    handleViewChange("Sidebar");
    setImportVisible(true);
  };

  useEffect(() => {
    setModalActive(currentView === "Delete" || currentView === "Add" || importVisible);
  }, [currentView, importVisible]);

  useEffect(() => {
    setFilteredRecipes(
      Object.entries(recipes)
        .filter(([, item]) => item.name.toLowerCase().includes(filter.toLowerCase()))
        .reverse()
    );
  }, [filter, recipes]);

  useEffect(() => {
    setDatabase(user ? new Database(user, handleRecipeListChange, handleCategoryListChange) : null);
  }, [user]);

  useEffect(() => {
    login(setUser);
  }, []);

  return (
    <div id="app">
      <Sidebar
        categories={categories}
        changeSelectedItem={setSelectedSidebarItem}
        classes={modalActive ? "disabled" : ""}
        handleAddCategory={handleAddCategory}
        handleExport={handleExport}
        handleImport={handleImport}
        handleSignOut={() => signOut(setUser)}
        selectedItem={selectedSidebarItem}
      />
      <div
        id="main-content"
        className={`${currentView === "Sidebar" ? "shifted-right" : modalActive ? "disabled" : ""}`}
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
        <AddForm
          handleAddRecipe={handleAddRecipe}
          visible={currentView === "Add"}
          initialValues={editMode ? recipes[selectedRecipe] : {}}
        />
        <DeleteForm handleDeleteRecipe={handleDeleteRecipe} visible={currentView === "Delete"} />
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
          <ImportForm
            handleAddRecipe={recipe => database.addRecipe(recipe)}
            importString={importString}
            setImportString={setImportString}
            setValid={setImportValid}
            valid={importValid}
            visible={importVisible}
          />
        </Modal>
      </div>
    </div>
  );
});
