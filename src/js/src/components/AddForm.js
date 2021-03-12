import React, { useContext, useEffect, useRef, useState } from "react";
import { scrape } from "../backend/operations";

import { colors, Views } from "../lib/common";
import { CategoriesContext, ViewContext } from "../lib/context";

import AddFormList from "./AddFormList";
import Button from "./Button";
import TextInput from "./TextInput";

import "./AddForm.scss";

export default function AddForm({ handleAddRecipe, initialValues }) {
  const initialForm = useRef({
    name: "",
    desc: "",
    cookTime: "",
    yield: "",
    categories: [""],
    ingredients: [""],
    instructions: [""],
    imgSrc: "",
  });
  const currentView = useContext(ViewContext);
  const { categories } = useContext(CategoriesContext);
  // const [submitHover, setSubmitHover] = useState(false);
  const [form, setForm] = useState({
    ...initialForm.current,
    ...initialValues,
    categories:
      initialValues.categories?.length > 0
        ? initialValues.categories.map(c => categories[c].name)
        : [""],
    ingredients: initialValues.ingredients?.length > 0 ? initialValues.ingredients : [""],
    instructions: initialValues.instructions?.length > 0 ? initialValues.instructions : [""],
  });
  const [urlToScrape, setUrlToScrape] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState({
    complete: false,
    inProgress: false,
    success: false,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setForm({
      ...initialForm.current,
      ...initialValues,
      categories:
        initialValues.categories?.length > 0
          ? initialValues.categories.map(c => categories[c].name)
          : [""],
      ingredients: initialValues.ingredients?.length > 0 ? initialValues.ingredients : [""],
      instructions: initialValues.instructions?.length > 0 ? initialValues.instructions : [""],
    });
    setUrlToScrape("");
    setScrapeStatus({
      complete: false,
      inProgress: false,
      success: false,
    });
  }, [visible, initialValues]);

  useEffect(() => {
    setVisible(currentView === Views.ADD);
  }, [currentView]);

  const valid = () => {
    const errors = {
      name: form.name.length === 0,
    };
    return [Object.keys(errors).some(x => errors[x]), errors];
  };

  const handleFormChange = e => {
    if (e.key) {
      return;
    }
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (valid()[0]) {
      return;
    }
    const categories = form.categories.map(c => c.trim()).filter(item => item !== "");
    const ingredients = form.ingredients.map(i => i.trim()).filter(item => item !== "");
    const instructions = form.instructions.map(i => i.trim()).filter(item => item !== "");

    handleAddRecipe({
      ...form,
      categories,
      ingredients,
      instructions,
    });
  };

  const scrapeUrl = () => {
    setScrapeStatus({ complete: false, inProgress: true, success: false });
    scrape(urlToScrape).then(res => {
      setScrapeStatus({ complete: true, inProgress: false, success: true });
      setTimeout(
        () =>
          setScrapeStatus({
            complete: false,
            inProgress: false,
            success: false,
          }),
        500
      );
      setForm({ ...form, ...res });
    });
  };

  // const [invalid, errors] = valid();

  return (
    <div id="add-form-card" className={`${visible ? "visible" : ""} card`}>
      {visible && (
        <form id="add-form">
          <TextInput
            placeholder="Recipe Name"
            name="name"
            setValue={handleFormChange}
            value={form.name}
            maxLength={200}
            autofocus
          />
          <TextInput
            placeholder="Description"
            name="desc"
            setValue={handleFormChange}
            value={form.desc}
          />
          <TextInput
            placeholder="Image URL"
            name="imgSrc"
            setValue={handleFormChange}
            value={form.imgSrc}
          />
          <TextInput
            placeholder="Cook Time (min)"
            name="cookTime"
            setValue={handleFormChange}
            value={form.cookTime}
          />
          <TextInput
            placeholder="Yield (servings)"
            name="yield"
            setValue={handleFormChange}
            value={form.yield}
          />
          <AddFormList
            name="categories"
            items={form.categories}
            setItems={handleFormChange}
            visible={visible}
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
          <h1 style={{ color: colors.OD_WHITE }}>OR</h1>
          <TextInput
            placeholder="Add by URL"
            name="scrapeUrl"
            setValue={e => setUrlToScrape(e.target.value)}
            value={urlToScrape}
          />
          <span style={{ display: "flex" }}>
            <Button id="add-form-cancel" onClick={() => handleAddRecipe()} secondary>
              Cancel
            </Button>
            <Button
              id="add-form-submit"
              // classes={`${invalid ? "error" : ""} form-btn`}
              // onMouseEnter={() => setSubmitHover(true)}
              // onMouseLeave={() => setSubmitHover(false)}
              onClick={handleSubmit}
              disabled={!form.name || scrapeStatus.inProgress}
            >
              Save Recipe
            </Button>
            <Button
              id="add-form-scrape"
              onClick={scrapeUrl}
              disabled={scrapeStatus.inProgress || urlToScrape === ""}
            >
              Scrape
            </Button>
          </span>
        </form>
      )}
    </div>
  );
}
