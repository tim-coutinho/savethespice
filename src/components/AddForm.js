import React, { useEffect, useState } from "react";

import AddFormList from "./AddFormList";
import Button from "./Button";
import TextInput from "./TextInput";

import "./AddForm.scss";

const initialForm = {
  categories: "",
  cookTime: "",
  desc: "",
  imgSrc: "",
  ingredients: [""],
  instructions: [""],
  name: "",
};

export default function AddForm({ handleAddRecipe, initialValues, visible }) {
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
      ingredients: form.ingredients.map(item => item.trim()).filter(item => item !== ""),
      instructions: form.instructions.map(item => item.trim()).filter(item => item !== ""),
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
        <TextInput
          placeholder="Recipe Name"
          name="name"
          setValue={handleFormChange}
          valid={valid}
          value={form.name}
          width="15em"
        />
        <TextInput
          placeholder="Description"
          name="desc"
          setValue={handleFormChange}
          value={form.desc}
          width="15em"
        />
        <TextInput
          placeholder="Image URL"
          name="imgSrc"
          setValue={handleFormChange}
          value={form.imgSrc}
          width="15em"
        />
        <TextInput
          placeholder="Categories"
          name="categories"
          setValue={handleFormChange}
          value={form.categories}
          width="15em"
        />
        <AddFormList name="ingredients" items={form.ingredients} setItems={handleFormChange} />
        <AddFormList
          name="instructions"
          items={form.instructions}
          setItems={handleFormChange}
          ordered
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
