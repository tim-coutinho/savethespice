import React, { useContext, useEffect, useState } from "react";
import { scrape } from "../backend/operations";

import { colors, transitionDuration, useRenderTimeout, Views } from "../lib/common";
import { CategoriesContext, ViewContext } from "../lib/context";

import "./AddForm.scss";

import AddFormList from "./AddFormList";
import Button from "./Button";
import TextInput from "./TextInput";

const baseForm = {
  name: "",
  desc: "",
  cookTime: "",
  yield: "",
  categories: [""],
  ingredients: [""],
  instructions: [""],
  imgSrc: "",
};

export default function AddForm({ handleAddRecipe, initialValues }) {
  const { currentView, setCurrentView } = useContext(ViewContext);
  const { categories } = useContext(CategoriesContext);
  // const [submitHover, setSubmitHover] = useState(false);
  const [form, setForm] = useState({
    ...baseForm,
    ...initialValues,
    categories: initialValues.categories?.map(c => categories[c].name),
    ingredients: initialValues.ingredients,
    instructions: initialValues.instructions,
  });
  const [pending, setPending] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState({
    complete: false,
    inProgress: false,
    success: false,
  });
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setForm({
      ...baseForm,
      ...initialValues,
      categories: initialValues.categories?.map(c => categories[c].name),
      ingredients: initialValues.ingredients,
      instructions: initialValues.instructions,
    });
    setUrlToScrape("");
    setScrapeStatus({
      complete: false,
      inProgress: false,
      success: false,
    });
  }, [visible]);

  useEffect(() => {
    setVisible(currentView === Views.ADD);
  }, [currentView]);

  const valid = () => {
    const errors = {
      name: form.name.length === 0,
    };
    return [Object.keys(errors).some(x => errors[x]), errors];
  };

  const valueChanged = (initialValue, newValue) => {
    return (
      // Value is list, new value altered
      (typeof newValue === "object" && JSON.stringify(newValue) !== JSON.stringify(initialValue)) ||
      // Value initially present, new value altered
      (initialValue && newValue !== initialValue) ||
      // Value not initially present, new value present
      (initialValue === undefined && newValue)
    );
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
    const recipe = {
      ...form,
      categories: form.categories?.map(c => c.trim()).filter(item => item !== ""),
      ingredients: form.ingredients?.map(i => i.trim()).filter(item => item !== ""),
      instructions: form.instructions?.map(i => i.trim()).filter(item => item !== ""),
    };

    for (let [k, v] of Object.entries(recipe)) {
      // No op if nothing to update
      let initialValue = initialValues[k];
      if (k === "categories" && initialValue !== undefined) {
        // Categories holds IDs, map to category names
        initialValue = initialValue.map(c => categories[c].name);
      }
      if (valueChanged(initialValue, v)) {
        setPending(true);
        handleAddRecipe(recipe).finally(() => {
          setPending(false);
        });
        break;
      }
    }
    setCurrentView(Views.HOME);
  };

  const scrapeUrl = () => {
    setScrapeStatus({ complete: false, inProgress: true, success: false });
    scrape(urlToScrape).then(res => {
      setScrapeStatus({ complete: true, inProgress: false, success: !!res });
      setTimeout(
        () =>
          setScrapeStatus({
            complete: false,
            inProgress: false,
            success: false,
          }),
        500
      );
      res && setForm({ ...form, ...res });
    });
  };

  // const [invalid, errors] = valid();

  return (
    <div
      id="add-form"
      className={visible ? "visible" : ""}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {rendered && (
        <form id="add-form-form">
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
            items={form.categories ?? [""]}
            setItems={handleFormChange}
            // visible={visible}
          />
          <AddFormList
            name="ingredients"
            items={form.ingredients ?? [""]}
            setItems={handleFormChange}
            // visible={visible}
          />
          <AddFormList
            items={form.instructions ?? [""]}
            name="instructions"
            setItems={handleFormChange}
            // visible={visible}
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
            <Button id="add-form-cancel" onClick={() => setCurrentView(Views.HOME)} secondary>
              Cancel
            </Button>
            <Button
              id="add-form-submit"
              // classes={`${invalid ? "error" : ""} form-btn`}
              // onMouseEnter={() => setSubmitHover(true)}
              // onMouseLeave={() => setSubmitHover(false)}
              onClick={handleSubmit}
              disabled={pending || !form.name || scrapeStatus.inProgress}
            >
              Save Recipe
            </Button>
            <Button
              id="add-form-scrape"
              onClick={scrapeUrl}
              disabled={pending || scrapeStatus.inProgress || urlToScrape === ""}
            >
              Scrape
            </Button>
          </span>
        </form>
      )}
    </div>
  );
}
