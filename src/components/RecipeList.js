import React, { Component } from "react";
import Recipe from "./Recipe";
import RecipeLoader from "./RecipeLoader";


class RecipeList extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //
    //     };
    // }

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
                {this.props.items.length !== 0 ? this.props.items.map(recipe => (
                    <Recipe
                        key={recipe.id}
                        recipe={recipe}
                        onClick={() => this.props.changeSelectedItem(recipe)}
                        selected={this.props.selectedItem && this.props.selectedItem.id === recipe.id}
                    />)
                ) : Array(5).fill(0).map((_, i) => <RecipeLoader key={i}/>)
                }
            </ul>
        );
    }
}

export default RecipeList;
