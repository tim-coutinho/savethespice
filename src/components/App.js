import React, { Component } from "react";

import "./App.css";
import firebase from "../utils/firebase"

import RecipeList from "./RecipeList"
import Details from "./Details";
import Header from "./Header";


class App extends Component {
    constructor(props) {
        super(props);
        this.itemsRef = firebase.database().ref("items");
        this.state = {
            items: [],
            currentItem: null
        };
        this.handleAddItem = this.handleAddItem.bind(this);
        this.handleListChange = this.handleListChange.bind(this);
        this.changeFocusedItem = this.changeFocusedItem.bind(this);
    }

    handleAddItem() {
        const name = prompt("Item:");
        if (!name)
            return;
        const desc = prompt("Desciption:") || "";
        const imgSrc = prompt("Image url:") || "";
        this.itemsRef.push({name, desc, imgSrc});
    }

    handleListChange(snapshot) {
        const itemsRef = snapshot.val();
        const items = [];
        for (const item in itemsRef) {
            items.push({id: item, ...itemsRef[item]});
        }
        this.setState({
            items: items
        });
    }

    changeFocusedItem(item) {
        this.setState({
            currentItem: item
        });
    }

    componentDidMount() {
        this.itemsRef.on("value", this.handleListChange);
        this.itemsRef.on("child_removed", this.handleListChange);
    }

    render() {
        return (
            <div id="App">
                <div id="left">
                    <Header handleClick={this.handleAddItem}/>
                    <RecipeList recipes={this.state.items} changeFocusedItem={this.changeFocusedItem}/>
                </div>
                <div id="right">
                    <Details item={this.state.currentItem}/>
                </div>
            </div>
        );
    }
}

export default App;
