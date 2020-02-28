import { hot } from "react-hot-loader/root";  // Enable live component reloading
import React, { useEffect, useState } from "react";

import "./App.css";
import firebase from "../utils/firebase"

import RecipeList from "./RecipeList"
import Details from "./Details";
import Header from "./Header";


function App() {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

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
    };

    useEffect(() => {
        const itemsRef = firebase.ref("items");
        itemsRef.on("value", handleListChange);
        itemsRef.on("child_removed", handleListChange);
    }, []);

    return (
        <div id="App">
            <div id="left">
                <Header handleClick={handleAddItem}/>
                <RecipeList
                    items={items}
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
