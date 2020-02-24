import React, { Component } from "react";
import "./App.css";
import firebase from "./firebase";

class App extends Component {
    constructor(props) {
        super(props);
        this.items = firebase.database().ref("items");
        this.state = {
            items: [],
            currentItem: null
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleListChange = this.handleListChange.bind(this);
        this.changeFocusedItem = this.changeFocusedItem.bind(this);
    }

    handleClick() {
        const name = prompt("Item:");
        const desc = prompt("Desciption:");
        this.items.push({name: name, desc: desc});
    }

    changeFocusedItem(item) {
        this.setState({
            currentItem: item
        });
    }

    componentDidMount() {
        this.items.on("value", this.handleListChange);
        this.items.on("child_removed", this.handleListChange);
    }

    handleListChange(snapshot) {
        const itemsRef = snapshot.val();
        const items = [];
        for (const item in itemsRef) {
            items.push(itemsRef[item]);
        }
        this.setState({
            items: items
        });
    }

    render() {
        return (
            <div className="App">
                <div className="left">
                    <button id="add-button" onClick={this.handleClick}>+</button>
                    <ItemList items={this.state.items} changeFocusedItem={this.changeFocusedItem}/>
                </div>
                <div className="right">
                    <Details desc={this.state.currentItem && this.state.currentItem.desc}/>
                </div>
            </div>
        );
    }
}

class ItemList extends Component {
    render() {
        return (
            <ul id="item-list">
                {this.props.items.map(item => {
                    return (
                        <li key={item.id} onClick={() => this.props.changeFocusedItem(item)}>{item.name}</li>
                    );
                })}
            </ul>
        );
    }
}

class Details extends Component {
    render() {
        return (
            <div>{this.props.desc}</div>
        );
    }
}

export default App;
