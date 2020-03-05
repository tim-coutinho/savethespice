import { hot } from "react-hot-loader/root";  // Enable live component reloading
import React, { useEffect, useState } from "react";

import firebase from "../utils/firebase.js";

import AddForm from "./AddForm.js";
import Details from "./Details.js";
import Header from "./Header.js";
import RecipeList from "./RecipeList.js";
import Sidebar from "./Sidebar.js";

import "./App.css";


function App() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState("Home");
    const [categories, setCategories] = useState([]);
    const [selectedSidebarItem, setSelectedSidebarItem] = useState("All Recipes");

    const handleViewChange = (source) => {
        setCurrentView(() => {
            switch (source) {
            case "Sidebar":
                return currentView === "Home" ? "Sidebar" : "Home";
            case "Add":
                return currentView === "Add" ? "Home" : "Add";
            default:
                return "Home";
            }
        });
    };

    const handleListChange = snapshot => {
        setIsLoading(true);
        const itemsRef = snapshot.val();
        const items = [];
        const categoryNames = new Set();
        for (const itemId in itemsRef) {
            const item = itemsRef[itemId];
            items.push({id: itemId, ...item});
            if (item.categories) {
                for (const categoryId in item.categories) {
                    categoryNames.add(item.categories[categoryId]);
                }
            }
        }
        const categories = [{name: "All Recipes", selected: true}];
        for (const category of categoryNames) {
            categories.push({name: category, selected: false});
        }
        setItems(items);
        setFilteredItems(items);
        setCategories(categories);
        setIsLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    useEffect(() => {
        setFilteredItems(items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase())))
    }, [filter]);

    useEffect(() => {
        const itemsRef = firebase.ref("items");
        itemsRef.on("value", handleListChange);
        itemsRef.on("child_removed", handleListChange);
    }, []);

    return (
        <div id="app">
            <div
                id="main-content"
                className={`${currentView === "Sidebar" ? "shifted-right" : currentView === "Add" ? "disabled" : ""}`}
            >
                <Sidebar
                    categories={categories}
                    changeSelectedItem={setSelectedSidebarItem}
                    selectedItem={selectedSidebarItem}
                />
                <div id="left">
                    <Header
                        filter={filter}
                        shiftedRight={currentView === "Sidebar"}
                        handleFilterChange={handleFilterChange}
                        handleViewChange={handleViewChange}
                    />
                    <RecipeList
                        items={isLoading ? null : filteredItems}
                        changeSelectedRecipe={(item) => setSelectedRecipe(item)}
                        selectedCategory={selectedSidebarItem}
                        selectedRecipe={selectedRecipe}
                    />
                </div>
                <div id="right">
                    {selectedRecipe && <Details item={selectedRecipe}/>}
                </div>
            </div>
            <AddForm
                handleClose={() => handleViewChange("Add")}
                visible={currentView === "Add"}
            />
        </div>
    );
}

export default hot(App);
