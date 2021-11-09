import { ChangeEvent, KeyboardEvent, ReactElement, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { addRecipe, FormFields, scrape } from "../lib/operations";

import { transitionDuration, useRenderTimeout, View } from "../lib/common";
import {
  allRecipesState,
  categoriesState,
  currentViewState,
  selectedRecipeIdState,
} from "../store";

import "./AddForm.scss";

import Button from "./Button";
import TextInput from "./TextInput";
import { Category } from "../types";

const baseForm: FormFields = {
  name: "",
  desc: "",
  cookTime: "",
  yield: "",
  categories: [],
  ingredients: [],
  instructions: [],
  imgSrc: "",
};

interface AddFormProps {
  editMode: boolean;
}

export default ({ editMode }: AddFormProps): ReactElement => {
  const [pending, setPending] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState({
    complete: false,
    inProgress: false,
    success: false,
  });
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [allRecipes, setAllRecipes] = useRecoilState(allRecipesState);
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const selectedRecipe = allRecipes.get(selectedRecipeId);
  const initialValues = !editMode
    ? baseForm
    : ({
        ...selectedRecipe,
        categories: selectedRecipe?.categories?.map(c => "" + c) ?? [],
        createTime: undefined,
        userId: undefined,
        recipeId: undefined,
        updateTime: undefined,
      } as FormFields) ?? baseForm;
  const [form, setForm] = useState({ ...initialValues });
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setForm({
      ...baseForm,
      ...initialValues,
      categories: initialValues.categories?.map(c => categories.get(+c)?.name ?? ""),
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
    setVisible(currentView === View.ADD);
    console.log(form);
  }, [currentView]);

  const valid = () => {
    const errors: { [key: string]: boolean } = {
      name: form.name.length === 0,
    };
    return [Object.keys(errors).some(x => errors[x]), errors];
  };

  const valueChanged = (initialValue: keyof FormFields, newValue: FormFields[keyof FormFields]) =>
    // Value is list, new value altered
    (typeof newValue === "object" && JSON.stringify(newValue) !== JSON.stringify(initialValue)) ||
    // Value initially present, new value altered
    (initialValue && newValue !== initialValue) ||
    // Value not initially present, new value present
    (initialValue === undefined && newValue);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement> & KeyboardEvent) => {
    if (e.key) {
      return;
    }
    const { name, value } = e.currentTarget;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (valid()[0]) {
      return;
    }
    const recipe: FormFields = {
      ...form,
      categories: form.categories?.map(c => c.trim()).filter(item => item !== ""),
      ingredients: form.ingredients?.map(i => i.trim()).filter(item => item !== ""),
      instructions: form.instructions?.map(i => i.trim()).filter(item => item !== ""),
    };

    for (const [k, v] of Object.entries(recipe)) {
      // No op if nothing to update
      let initialValue = initialValues[k as keyof FormFields];
      if (k === "categories" && (initialValue as string[])[0] !== "") {
        // Categories holds IDs, map to category names
        console.log(k, v, initialValue);
        initialValue = (initialValue as NonNullable<typeof recipe.categories>).map(
          c => (categories.get(+c) as Category).name,
        );
      }
      if (valueChanged(initialValue as keyof FormFields, v)) {
        setPending(true);
        const res = await addRecipe(recipe, editMode ? selectedRecipeId : undefined);
        setAllRecipes(allRecipes => new Map(allRecipes.set(res.recipeId, res)));
        if (res.newCategories) {
          setCategories(categories => {
            res.newCategories?.forEach(c => categories.set(c.categoryId, c));
            return new Map(categories);
          });
        }
        setPending(false);
        break;
      }
    }
    setCurrentView(View.HOME);
  };

  const scrapeUrl = () => {
    setScrapeStatus({ complete: false, inProgress: true, success: false });
    scrape(urlToScrape)
      .then(res => {
        setScrapeStatus({ complete: true, inProgress: false, success: res === undefined });
        res && setForm({ ...form, ...res });
      })
      .catch()
      .finally(() => setScrapeStatus({ complete: false, inProgress: false, success: false }));
  };

  return (
    <div
      id="add-modal"
      className={visible ? "visible" : ""}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {rendered && (
        <>
          <form id="add-modal-form">
            <TextInput
              placeholder="Recipe Name"
              name="name"
              setValue={handleFormChange}
              value={form.name}
              width="100%"
              maxLength={200}
              autofocus
            />
            <TextInput
              placeholder="Description"
              name="desc"
              setValue={handleFormChange}
              value={form.desc ?? ""}
              width="100%"
            />
            <TextInput
              placeholder="Image URL"
              name="imgSrc"
              setValue={handleFormChange}
              value={form.imgSrc ?? ""}
              width="100%"
            />
            <TextInput
              placeholder="Cook Time (min)"
              name="cookTime"
              setValue={handleFormChange}
              value={form.cookTime ?? ""}
              width="100%"
            />
            <TextInput
              placeholder="Yield (servings)"
              name="yield"
              setValue={handleFormChange}
              value={form.yield ?? ""}
              width="100%"
            />
            <TextInput
              placeholder="Categories"
              name="categories"
              value={form.categories ?? []}
              setValue={handleFormChange}
              width="100%"
            />
            <TextInput
              placeholder="Ingredients"
              name="ingredients"
              value={form.ingredients ?? []}
              setValue={handleFormChange}
              width="100%"
            />
            <TextInput
              placeholder="Instructions"
              name="instructions"
              value={form.instructions ?? []}
              setValue={handleFormChange}
              width="100%"
              // ordered
            />
            <h1 style={{ color: "var(--text-color)", textAlign: "center" }}>OR</h1>
            <TextInput
              placeholder="Add by URL"
              name="scrapeUrl"
              setValue={e => setUrlToScrape(e.currentTarget.value)}
              value={urlToScrape}
              width="100%"
            />
          </form>
          <div id="add-modal-btns">
            <Button id="add-modal-cancel" onClick={() => setCurrentView(View.HOME)} secondary>
              Cancel
            </Button>
            <Button
              id="add-modal-submit"
              onClick={handleSubmit}
              disabled={pending || !form.name || scrapeStatus.inProgress}
            >
              Save Recipe
            </Button>
            <Button
              id="add-modal-scrape"
              onClick={scrapeUrl}
              disabled={pending || scrapeStatus.inProgress || urlToScrape === ""}
            >
              Scrape
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
