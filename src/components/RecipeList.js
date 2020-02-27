import React, { Component } from "react";
import Recipe from "./Recipe";
import Loader from "./Loader";


class RecipeList extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //
        // };
    }

    // static getDerivedStateFromProps(props, state) {
    //
    // }

    // componentDidMount() {
    //
    // }

    // shouldComponentUpdate(nextProps, nextState) {
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
                                                      recipe={recipe}
                                                      onClick={() => this.props.changeSelectedItem(recipe)}
                                                      selected={this.props.selectedItem && this.props.selectedItem.id === recipe.id}
                                                  />
                )}
                <div className={`${this.props.selected ? "selected-recipe" : ""} recipe-wrapper`} onClick={this.props.onClick}>
                    <li className="recipe">
                        <Loader/>
                    </li>
                </div>
            </ul>
        );
    }
}

export default RecipeList;
