import { hot } from "react-hot-loader/root";  // Enable live component reloading
import React, { useEffect, useState } from "react";

import firebase from "../utils/firebase.js";

import Details from "./Details.js";
import Header from "./Header.js";
import RecipeList from "./RecipeList.js";
import Sidebar from "./Sidebar.js";

import "./App.css";


function App() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [shiftedRight, setShiftedRight] = useState(false);

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
        setIsLoading(true);
        const itemsRef = snapshot.val();
        const items = [];
        for (const item in itemsRef) {
            items.push({id: item, ...itemsRef[item]});
        }
        setItems(items);
        setFilteredItems(items);
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
        <div id="app" className={shiftedRight ? "shifted" : ""}>
            <Sidebar/>
            <div id="left">
                <Header
                    filter={filter}
                    shiftedRight={shiftedRight}
                    handleAdd={handleAddItem}
                    handleFilterChange={handleFilterChange}
                    handleShiftRight={() => setShiftedRight(!shiftedRight)}
                />
                <RecipeList
                    items={isLoading ? null : filteredItems}
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
