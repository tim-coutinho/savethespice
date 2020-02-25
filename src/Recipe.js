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
            <li className="recipe" onClick={this.props.onClick}>
                {this.props.name}
            </li>
        );
    }
}

export default Recipe;
