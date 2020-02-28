import React, { Component } from "react";


class Recipe extends Component {
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
        // const imgWidth = 120;
        // const imgHeight = 80;
        return (
            <div className={`${this.props.selected ? "selected-recipe" : ""} recipe-wrapper`} onClick={this.props.onClick}>
                <li className="recipe">
                    <div className="recipe-text">{this.props.recipe.name}</div>
                    <img
                        className="recipe-img"
                        src={this.props.recipe.imgSrc}
                        // style={{height: `${imgHeight}px`, width: `${imgWidth}px`}}
                        alt={this.props.recipe.name}
                    />
                </li>
            </div>
        );
    }
}

export default Recipe;
