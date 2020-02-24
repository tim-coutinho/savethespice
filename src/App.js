import React, { Component } from "react";
import "./App.css";
import firebase from "./firebase";


class App extends Component {
    constructor(props) {
        super(props);
        this.itemsRef = firebase.database().ref("items");
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
        const desc = name && prompt("Desciption:");
        desc && this.itemsRef.push({name: name, desc: desc});
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
                    <TopLeft handleClick={this.handleClick}/>
                    <BottomLeft>
                        <ItemList items={this.state.items} changeFocusedItem={this.changeFocusedItem}/>
                    </BottomLeft>
                </div>
                <div id="right">
                    <Details desc={this.state.currentItem && this.state.currentItem.desc}/>
                </div>
            </div>
        );
    }
}

class TopLeft extends Component {
    render() {
        return (
            <div id="top-left">
                <button id="add-button" onClick={this.props.handleClick}>+</button>
            </div>
        );
    }
}

class BottomLeft extends Component {
    render() {
        return (
            <div id="bottom-left">
                {this.props.children}
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
