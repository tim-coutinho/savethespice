import React, { Component } from "react";

import "./AddForm.scss";

const initialForm = {
    "categories": [],
    "cookTime": "",
    "imgSrc": "",
    "ingredients": [],
    "instructions": [],
    "name": "",
    "desc": ""
};

export default class AddForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {...initialForm, ...this.props.initialValues},
            submitHover: false
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {initialValues, visible} = this.props;
        if (visible !== prevProps.visible || initialValues !== prevProps.initialValues) {
            this.setState({form: {...initialForm, ...initialValues}});
        }
    }

    handleFormChange = e => {
        e.preventDefault();
        const {name, value} = e.target;
        this.setState({form: {...this.state.form, [name]: value}});
    };

    handleSubmit = e => {
        e.preventDefault();
        if (this.valid()[0]) {
            return;
        }
        const {form} = this.state;
        const lastEditedTime = new Date().getTime();
        this.props.handleAddRecipe({
            ...form,
            originalSubmitTime: form.lastEditedTime ? form.lastEditedTime : lastEditedTime,
            lastEditedTime
        });
    };

    valid = () => {
        const errors = {
            name: this.state.form.name.length === 0
        };
        return [Object.keys(errors).some(x => errors[x]), errors];
    };

    render() {
        const {form} = this.state;
        const [invalid, errors] = this.valid();

        return (
            <div id="add-form-card" className={`${this.props.visible ? "visible" : ""} card`}>
                <form id="add-form" onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        className={this.state.submitHover && errors["name"] ? "error" : ""}
                        onChange={this.handleFormChange}
                        name="name"
                        value={form.name}
                        placeholder="Recipe Name"
                    />
                    <br/>
                    <input
                        type="text"
                        className={this.state.submitHover && errors["desc"] ? "error" : ""}
                        onChange={this.handleFormChange}
                        name="desc"
                        value={form.desc}
                        placeholder="Description"
                    />
                    <br/>
                    <input
                        type="text"
                        className={this.state.submitHover && errors["imgSrc"] ? "error" : ""}
                        onChange={this.handleFormChange}
                        name="imgSrc"
                        value={form.imgSrc}
                        placeholder="Image URL"
                    />
                    <div
                        id="add-form-cancel"
                        className="form-btn primary-btn"
                        onClick={() => this.props.handleAddRecipe()}
                    >
                        Cancel
                    </div>
                    <input
                        type="submit"
                        id="add-form-submit"
                        className={`${invalid ? "error" : ""} form-btn primary-btn`}
                        value="Save Recipe"
                        onMouseEnter={() => this.setState({submitHover: true})}
                        onMouseLeave={() => this.setState({submitHover: false})}
                    />
                </form>
            </div>
        );
    }
}
