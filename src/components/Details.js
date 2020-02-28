import React, { Component } from "react";


class Details extends Component {
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
            <div>
                {this.props.item.desc}
                <img className="recipe-img" src={this.props.item.imgSrc} alt={this.props.item.name}/>
            </div>
        );
    }
}

export default Details;
