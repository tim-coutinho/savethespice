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
            valid: true
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

    handleSubmit = (e) => {
        e.preventDefault();
        this.validate();
    };

    validate = () => {
        this.setState({
            valid: this.state.form !== ""
        }, () => {
            if (!this.state.valid) {
                return;
            }
            const {form} = this.state;
            const lastEditedTime = new Date().getTime();
            this.props.handleAddRecipe({
                ...form,
                originalSubmitTime: form.lastEditedTime ? form.lastEditedTime : lastEditedTime,
                lastEditedTime
            });
        });
    };

    render() {
        const { form } = this.state;

        return (
            <div id="add-form-card" className={this.props.visible ? "visible" : ""}>
                <form id="add-form" onSubmit={this.handleSubmit} noValidate>
                    <input
                        type="text"
                        onChange={this.handleFormChange}
                        name="name"
                        value={form.name}
                        placeholder="Recipe Name"
                        style={{borderColor: this.state.valid ? "gray" : "red"}}
                        required
                    />
                    <br/>
                    <input
                        type="text"
                        onChange={this.handleFormChange}
                        name="desc"
                        value={form.desc}
                        placeholder="Notes"
                    />
                    <br/>
                    <input
                        type="text"
                        onChange={this.handleFormChange}
                        name="imgSrc"
                        value={form.imgSrc}
                        placeholder="Image URL"
                    />
                    <div
                        id="add-form-cancel"
                        className="form-btn purple-btn"
                        onClick={() => this.props.handleAddRecipe()}
                    >
                        Cancel
                    </div>
                    <input
                        type="submit"
                        id="add-form-submit"
                        className="form-btn purple-btn"
                        value="Save Recipe"
                    />
                </form>
            </div>
        );
    }
}
