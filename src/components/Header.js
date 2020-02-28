import React, { Component } from "react";


class Header extends Component {
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
            <div id="header">
                <i id="add-button" onClick={this.props.handleClick} className="material-icons">add_box</i>
            </div>
        );
    }
}

export default Header;
