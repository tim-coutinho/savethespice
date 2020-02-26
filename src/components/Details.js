import React, { Component } from "react";


class Details extends Component {
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
            <div>
                {this.props.item && (
                    <div>
                        {this.props.item.desc}
                        <img className="recipe-img" src={this.props.item.imgSrc} alt="Recipe image"/>
                    </div>
                )}
            </div>
        );
    }
}

export default Details;
