import React, { useEffect, useState } from "react";

import "./AddForm.css";


const initialForm = {
    "categories": [],
    "cookTime": "",
    "imgSrc": "",
    "ingredients": [],
    "instructions": [],
    "name": "",
    "notes": ""
};

export default function AddForm({visible, handleAddRecipe, initialValues}) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        visible && setForm({...initialForm, ...initialValues});
    }, [visible, initialValues]);

    const handleFormChange = e => {
        e.preventDefault();
        console.log(e.target);
        const {name, value} = e.target;
        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const lastEditedTime = new Date().getTime();
        handleAddRecipe({
            ...form,
            originalSubmitTime: form.lastEditedTime ? form.lastEditedTime : lastEditedTime,
            lastEditedTime
        });
    };

    return (
        <div id="add-form-card" className={visible ? "visible" : ""}>
            <form id="add-form" onSubmit={handleSubmit}>
                <input
                    className="standard-text"
                    onChange={handleFormChange}
                    name="name"
                    value={form.name}
                    placeholder="Recipe Name"
                    required
                />
                <br/>
                <input
                    className="standard-text"
                    onChange={handleFormChange}
                    name="notes"
                    value={form.notes}
                    placeholder="Notes"
                />
                <br/>
                <input
                    className="standard-text"
                    onChange={handleFormChange}
                    name="imgSrc"
                    value={form.imgSrc}
                    placeholder="Image URL"
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
