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
            selectedItem: null
        };
        this.handleAddItem = this.handleAddItem.bind(this);
        this.handleListChange = this.handleListChange.bind(this);
        this.changeSelectedItem = this.changeSelectedItem.bind(this);
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

    changeSelectedItem(item) {
        this.setState({
            selectedItem: item
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
                    <RecipeList recipes={this.state.items} changeSelectedItem={this.changeSelectedItem} selectedItem={this.state.selectedItem}/>
                </div>
                <div id="right">
                    <Details item={this.state.selectedItem}/>
                </div>
            </div>
        );
    }
}

export default App;
