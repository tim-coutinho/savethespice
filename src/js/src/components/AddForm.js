import React, { useEffect, useRef, useState } from "react";

import AddFormList from "./AddFormList";
import Button from "./Button";
import TextInput from "./TextInput";
import colors from "../utils/colors";

import "./AddForm.scss";

export default function AddForm({ handleAddRecipe, initialValues, visible }) {
  const initialForm = useRef({
    categories: "",
    cookTime: "",
    desc: "",
    imgSrc: "",
    ingredients: [""],
    instructions: [""],
    name: "",
  });
  const [submitHover, setSubmitHover] = useState(false);
  const [form, setForm] = useState({
    ...initialForm.current,
    ...initialValues,
    categories: initialValues.categories?.join(" ") || "",
    ingredients: initialValues.ingredients?.length > 0 ? initialValues.ingredients : [""],
    instructions: initialValues.instructions?.length > 0 ? initialValues.instructions : [""],
  });

  useEffect(() => {
    visible &&
      setForm({
        ...initialForm.current,
        ...initialValues,
        categories: initialValues.categories?.join(" ") || "",
        ingredients: initialValues.ingredients?.length > 0 ? initialValues.ingredients : [""],
        instructions: initialValues.instructions?.length > 0 ? initialValues.instructions : [""],
      });
  }, [visible, initialValues]);

  const handleFormChange = e => {
    if (e.key) {
      return;
    }
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = e => {
    if (valid()[0]) {
      return;
    }
    const lastEditedTime = new Date().getTime();
    const categories = form.categories !== "" ? form.categories.split(" ") : [];
    const ingredients = form.ingredients.map(item => item.trim()).filter(item => item !== "");
    const instructions = form.instructions.map(item => item.trim()).filter(item => item !== "");

    handleAddRecipe({
      ...form,
      categories,
      ingredients,
      instructions,
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
        <AddFormList
          name="ingredients"
          items={form.ingredients}
          setItems={handleFormChange}
          visible={visible}
        />
        <AddFormList
          items={form.instructions}
          name="instructions"
          setItems={handleFormChange}
          visible={visible}
          ordered
        />
        <span style={{ display: "flex" }}>
          <Button
            classes="form-btn"
            id="add-form-cancel"
            onClick={() => handleAddRecipe()}
            primaryColor={colors.WHITE}
            secondaryColor={colors.OD_PURPLE}
            secondary
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
