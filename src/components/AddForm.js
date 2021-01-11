import React, { useEffect, useRef, useState } from "react";

import Button from "./Button";

import "./AddForm.scss";

const initialForm = {
  categories: "",
  cookTime: "",
  desc: "",
  imgSrc: "",
  // ingredients: "",
  // instructions: "",
  name: "",
};

export default function AddForm({ handleAddRecipe, initialValues, visible }) {
  const inputRef = useRef(null);
  const [submitHover, setSubmitHover] = useState(false);
  const [form, setForm] = useState({
    ...initialForm,
    ...initialValues,
    categories: initialValues.categories?.join(" ") || "",
  });

  useEffect(() => {
    setForm({
      ...initialForm,
      ...initialValues,
      categories: initialValues.categories?.join(" ") || "",
    });
  }, [visible, initialValues]);

  useEffect(() => {
    visible && setTimeout(() => inputRef.current.focus(), 100);
  }, [visible]);

  const handleFormChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (valid()[0]) {
      return;
    }
    const lastEditedTime = new Date().getTime();
    handleAddRecipe({
      ...form,
      categories: form.categories !== "" ? form.categories.split(" ") : [],
      // ingredients: form.ingredients !== "" ? form.ingredients.split(" ") : [],
      // instructions: form.instructions !== "" ? form.instructions.split(" ") : [],
      originalSubmitTime: form.lastEditedTime || lastEditedTime,
      lastEditedTime,
    });
  };

  const valid = () => {
    const errors = {
      name: form.name.length === 0,
    };
    return [Object.keys(errors).some(x => errors[x]), errors];
  };

  const [invalid, errors] = valid();

  return (
    <div id="add-form-card" className={`${visible ? "visible" : ""} card`}>
      <form id="add-form">
        <input
          type="text"
          className={submitHover && errors["name"] ? "error" : ""}
          onChange={handleFormChange}
          name="name"
          value={form.name}
          placeholder="Recipe Name"
          ref={inputRef}
        />
        <br />
        <input
          type="text"
          className={submitHover && errors["desc"] ? "error" : ""}
          onChange={handleFormChange}
          name="desc"
          value={form.desc}
          placeholder="Description"
        />
        <br />
        <input
          type="text"
          className={submitHover && errors["imgSrc"] ? "error" : ""}
          onChange={handleFormChange}
          name="imgSrc"
          value={form.imgSrc}
          placeholder="Image URL"
        />
        <br />
        <input
          type="text"
          className={submitHover && errors["categories"] ? "error" : ""}
          onChange={handleFormChange}
          name="categories"
          value={form.categories}
          placeholder="Categories"
        />
        <span style={{ display: "flex" }}>
          <Button
            id="add-form-cancel"
            classes="form-btn"
            onClick={() => handleAddRecipe()}
            style={{ marginRight: "10px" }}
          >
            Cancel
          </Button>
          <Button
            id="add-form-submit"
            classes={`${invalid ? "error" : ""} form-btn`}
            onMouseEnter={() => setSubmitHover(true)}
            onMouseLeave={() => setSubmitHover(false)}
            onClick={handleSubmit}
          >
            Save Recipe
          </Button>
        </span>
      </form>
    </div>
  );
}
