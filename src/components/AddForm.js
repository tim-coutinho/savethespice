import React, { useEffect, useState } from "react";

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

export default function AddForm(props) {
    const [submitHover, setSubmitHover] = useState(false);
    const [form, setForm] = useState({...initialForm, ...props.initialValues});

    useEffect(() => {
        setForm({...initialForm, ...props.initialValues});
    }, [props.visible, props.initialValues]);

    const handleFormChange = e => {
        e.preventDefault();
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (valid()[0]) {
            return;
        }
        const lastEditedTime = new Date().getTime();
        props.handleAddRecipe({
            ...form,
            originalSubmitTime: form.lastEditedTime ? form.lastEditedTime : lastEditedTime,
            lastEditedTime
        });
    };

    const valid = () => {
        const errors = {
            name: form.name.length === 0
        };
        return [Object.keys(errors).some(x => errors[x]), errors];
    };

    const [invalid, errors] = valid();

    return (
        <div id="add-form-card" className={`${props.visible ? "visible" : ""} card`}>
            <form id="add-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className={submitHover && errors["name"] ? "error" : ""}
                    onChange={handleFormChange}
                    name="name"
                    value={form.name}
                    placeholder="Recipe Name"
                />
                <br/>
                <input
                    type="text"
                    className={submitHover && errors["desc"] ? "error" : ""}
                    onChange={handleFormChange}
                    name="desc"
                    value={form.desc}
                    placeholder="Description"
                />
                <br/>
                <input
                    type="text"
                    className={submitHover && errors["imgSrc"] ? "error" : ""}
                    onChange={handleFormChange}
                    name="imgSrc"
                    value={form.imgSrc}
                    placeholder="Image URL"
                />
                <div
                    id="add-form-cancel"
                    className="form-btn primary-btn"
                    onClick={() => props.handleAddRecipe()}
                >
                    Cancel
                </div>
                <input
                    type="submit"
                    id="add-form-submit"
                    className={`${invalid ? "error" : ""} form-btn primary-btn`}
                    value="Save Recipe"
                    onMouseEnter={() => setSubmitHover(true)}
                    onMouseLeave={() => setSubmitHover(false)}
                />
            </form>
        </div>
    );
}
