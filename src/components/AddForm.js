import React, { useState } from "react";

import "./AddForm.css";


export default function AddForm({visible, handleAddRecipe, initialValues}) {
    const initialForm = {
        "categories": [],
        "cookTime": "",
        "imgSrc": "",
        "ingredients": [],
        "instructions": [],
        "name": "",
        "notes": "",
        ...initialValues
    };
    const [form, setForm] = useState(initialForm);

    const handleFormChange = e => {
        e.preventDefault();
        const {name, value} = e.target;
        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitTime = new Date().getTime();
        handleAddRecipe({
            ...form,
            submitTime
        });
        setForm(initialForm);
    };

    return (
        <div id="add-form-card" className={visible ? "visible" : ""}>
            <form id="add-form" onSubmit={handleSubmit} noValidate>
                <input
                    className="standard-text"
                    onChange={handleFormChange}
                    name="name"
                    value={form["name"]}
                    placeholder="Recipe Name"
                    required
                />
                <br/>
                <input
                    className="standard-text"
                    onChange={handleFormChange}
                    name="notes"
                    value={form["notes"]}
                    placeholder="Notes"
                    required
                />
                <br/>
                <input
                    className="standard-text"
                    onChange={handleFormChange}
                    name="imgSrc"
                    value={form["imgSrc"]}
                    placeholder="Image URL"
                    required
                />
                <div
                    id="add-form-cancel"
                    className="form-btn purple-btn standard-text"
                    onClick={() => handleAddRecipe()}
                >
                    Cancel
                </div>
                <input
                    type="submit"
                    id="add-form-submit"
                    className="form-btn purple-btn standard-text"
                    value="Save Recipe"
                />
            </form>
        </div>
    );
}
