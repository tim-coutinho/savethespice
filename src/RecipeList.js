import React, { Component } from "react";
import Recipe from "./Recipe";


class RecipeList extends Component {
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
            <ul id="recipe-list">
                {this.props.recipes.map(recipe => <Recipe
                                                      key={recipe.id}
                                                      name={recipe.name}
                                                      desc={recipe.description}
                                                      onClick={() => this.props.changeFocusedItem(recipe)}
                                                  />
                )}
            </ul>
        );
    }
}

export default RecipeList;
