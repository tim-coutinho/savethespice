import React, { Component } from "react";


class Recipe extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //
        // };
    }

    // componentWillMount() {
    //
    // }

    // componentDidMount() {
    //
    // }

    // componentWillReceiveProps(nextProps) {
    //
    // }

    // shouldComponentUpdate(nextProps, nextState) {
    //
    // }

    // componentWillUpdate(nextProps, nextState) {
    //
    // }

    // componentDidUpdate(prevProps, prevState) {
    //
    // }

    // componentWillUnmount() {
    //
    // }

    render() {
        return (
            <div className={`${this.props.selected ? "selected-recipe" : ""} recipe-wrapper`} onClick={this.props.onClick}>
                <li className="recipe">
                    <div className="recipe-text">{this.props.recipe.name}</div>
                    <img className="recipe-img" src={this.props.recipe.imgSrc} alt="Recipe image"/>
                </li>
            </div>
        );
    }
}

export default Recipe;
