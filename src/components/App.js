import { hot } from "react-hot-loader/root";  // Enable live component reloading
import React, { useEffect, useState } from "react";

import firebase, { auth, provider } from "../utils/firebase.js";

import AddForm from "./AddForm.js";
import Details from "./Details.js";
import Header from "./Header.js";
import RecipeList from "./RecipeList.js";
import Sidebar from "./Sidebar.js";

import "./App.css";


function App() {
    const [user, setUser] = useState(auth.currentUser);
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState("Home");
    const [categories, setCategories] = useState([]);
    const [selectedSidebarItem, setSelectedSidebarItem] = useState("All Recipes");
    var editItem = {};

    const handleViewChange = (source, args = {}) => {
        setCurrentView(() => {
            switch (source) {
            case "Add":
                if (currentView === "Home") {
                    if ("item" in args) {
                        editItem = args["item"];
                    } else {
                        editItem = {};
                    }
                }
                return currentView === "Add" ? "Home" : "Add";
            case "Edit":
                return "";
            case "Sidebar":
                return currentView === "Home" ? "Sidebar" : "Home";
            default:
                return "Home";
            }
        });
    };

    const handleAddRecipe = values => {
        if (values) {
            const [ingredients, instructions] = [{}, {}];
            for (const [i, element] of values.ingredients.entries()) {
                ingredients[i] = element;
            }
            for (const [i, element] of values.instructions.entries()) {
                instructions[i] = element;
            }
            const itemsRef = firebase.ref(`users/${user.uid}/recipes`);
            if ("id" in values) {
                itemsRef.child(user.uid).set({
                    ...values,
                    ingredients,
                    instructions
                });
            } else {
                itemsRef.push({
                    ...values,
                    ingredients,
                    instructions
                });
            }
        }
        handleViewChange("Add");
    };

    const handleListChange = snapshot => {
        setIsLoading(true);
        const itemList = snapshot.val();
        const items = [];
        const categoryNames = new Set();
        for (const itemId in itemList) {
            const item = itemList[itemId];
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
        if (!user) {
            return;
        }
        const itemsRef = firebase.ref(`users/${user.uid}/recipes`);
        itemsRef.on("value", handleListChange);
        itemsRef.on("child_removed", handleListChange);
    }, [user]);

    useEffect(() => {
        auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            } else {
                auth.signInWithRedirect(provider);
                auth.getRedirectResult().then(result => {
                    setUser(result.user);
                });
            }
        });
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
                        handleViewChange={handleViewChange}
                    />
                </div>
                <div id="right">
                    {selectedRecipe && <Details item={selectedRecipe}/>}
                </div>
            </div>
            <AddForm
                handleAddRecipe={handleAddRecipe}
                visible={currentView === "Add"}
                initialValues={editItem}
            />
        </div>
    );
}

export default hot(App);
