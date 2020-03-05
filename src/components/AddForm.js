import React, { useState } from "react";

import "./AddForm.css";


export default function AddForm({visible, handleClose}) {
    const [form, setForm] = useState({
        "categories": [],
        "ingredients": [],
        "instructions": [],
        "name": "",
        "notes": "",
        "time": "",
    });

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
        handleClose();
    };

    return (
        <div id="add-form-card" className={visible ? "visible" : ""}>
            <form id="add-form" onSubmit={handleSubmit}>
                <input
                    className="form-field standard-text"
                    onChange={handleFormChange}
                    name="name"
                    value={form["name"]}
                />
                <div
                    id="add-form-cancel"
                    className="form-btn form-field purple-btn standard-text"
                    onClick={handleClose}
                >
                    Cancel
                </div>
                <input
                    type="submit"
                    id="add-form-submit"
                    className="form-btn form-field purple-btn standard-text"
                    value="Save Recipe"
                />
            </form>
        </div>
    );
}
