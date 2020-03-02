import { hot } from "react-hot-loader/root";  // Enable live component reloading
import React, { useEffect, useState } from "react";

import "./App.css";
import firebase from "../utils/firebase";

import RecipeList from "./RecipeList";
import Details from "./Details";
import Header from "./Header";


function App() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleAddItem = () => {
        const itemsRef = firebase.ref("items");
        const name = prompt("Item:");
        if (!name)
            return;
        const desc = prompt("Desciption:") || "";
        const imgSrc = prompt("Image url:") || "";
        itemsRef.push({name, desc, imgSrc});
    };

    const handleListChange = snapshot => {
        const itemsRef = snapshot.val();
        const items = [];
        for (const item in itemsRef) {
            items.push({id: item, ...itemsRef[item]});
        }
        setItems(items);
        setFilteredItems(items);
    };

    const handleFilterChange = (e) => {
        e.preventDefault();
        setFilter(e.target.value);
    };

    useEffect(() => {
        setFilteredItems(items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase())))
    }, [filter]);

    useEffect(() => {
        const itemsRef = firebase.ref("items");
        itemsRef.on("value", handleListChange);
        itemsRef.on("child_removed", handleListChange);
        setIsLoading(false);
    }, []);

    return (
        <div id="App">
            <div id="left">
                <Header
                    filter={filter}
                    handleFilterChange={handleFilterChange}
                    handleClick={handleAddItem}
                />
                <RecipeList
                    items={isLoading ? null : (filteredItems.length !== 0 ? filteredItems : null)}
                    changeSelectedItem={(item) => setSelectedItem(item)}
                    selectedItem={selectedItem}
                />
            </div>
            <div id="right">
                {selectedItem && <Details item={selectedItem}/>}
            </div>
        </div>
    );
}

export default hot(App);
