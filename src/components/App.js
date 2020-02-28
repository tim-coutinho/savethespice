import { hot } from "react-hot-loader/root";
import React, { Component } from "react";

import "./App.css";
import firebase from "../utils/firebase"

import RecipeList from "./RecipeList"
import Details from "./Details";
import Header from "./Header";


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            selectedItem: null
        };
        this.handleAddItem = this.handleAddItem.bind(this);
        this.handleListChange = this.handleListChange.bind(this);
        this.changeSelectedItem = this.changeSelectedItem.bind(this);
    }

    handleAddItem() {
        const itemsRef = firebase.ref("items");
        const name = prompt("Item:");
        if (!name)
            return;
        const desc = prompt("Desciption:") || "";
        const imgSrc = prompt("Image url:") || "";
        itemsRef.push({name, desc, imgSrc});
    }

    handleListChange(snapshot) {
        const itemsRef = snapshot.val();
        const items = [];
        for (const item in itemsRef) {
            items.push({id: item, ...itemsRef[item]});
        }
        this.setState({items});
    }

    changeSelectedItem(item) {
        this.setState({
            selectedItem: item
        });
    }

    componentDidMount() {
        const itemsRef = firebase.ref("items");
        itemsRef.on("value", this.handleListChange);
        itemsRef.on("child_removed", this.handleListChange);
    }

    render() {
        return (
            <div id="App">
                <div id="left">
                    <Header handleClick={this.handleAddItem}/>
                    <RecipeList
                        items={this.state.items}
                        changeSelectedItem={this.changeSelectedItem}
                        selectedItem={this.state.selectedItem}
                    />
                </div>
                <div id="right">
                    {this.state.selectedItem && <Details item={this.state.selectedItem}/>}
                </div>
            </div>
        );
    }
}

export default hot(App);
