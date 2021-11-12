import {
  ChangeEvent,
  ClipboardEventHandler,
  KeyboardEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { addRecipe, FormFields, scrape } from "../lib/operations";

import { transitionDuration, View } from "../lib/common";
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
import { AsyncRequestStatus, useAsync, useRenderTimeout } from "../lib/hooks";

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
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [allRecipes, setAllRecipes] = useRecoilState(allRecipesState);
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const selectedRecipe = allRecipes.get(selectedRecipeId);
  const initialValues = !editMode
    ? baseForm
    : ({
        ...selectedRecipe,
        categories: selectedRecipe?.categories?.map(c => `${c}`) ?? [],
        createTime: undefined,
        userId: undefined,
        recipeId: undefined,
        updateTime: undefined,
      } as FormFields) ?? baseForm;
  const [form, setForm] = useState({ ...initialValues });
  const [urlToScrape, setUrlToScrape] = useState("");
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);
  const [executeScrape, scrapeRequest] = useAsync((url: string) => scrape(url));
  const [executeAddRecipe, addRecipeRequest] = useAsync((recipe: FormFields) =>
    addRecipe(recipe, editMode ? selectedRecipeId : undefined),
  );

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
  }, [visible]);

  useEffect(() => {
    setVisible(currentView === View.ADD);
  }, [currentView]);

  useEffect(() => {
    scrapeRequest.value && setForm({ ...form, ...scrapeRequest.value });
  }, [scrapeRequest]);

  useEffect(() => {
    if (addRecipeRequest.status === AsyncRequestStatus.SUCCESS) {
      const { value } = addRecipeRequest;
      if (value) {
        setAllRecipes(allRecipes => new Map(allRecipes.set(value.recipeId, value)));
        if (addRecipeRequest.value?.newCategories) {
          setCategories(categories => {
            addRecipeRequest.value?.newCategories?.forEach(c => categories.set(c.categoryId, c));
            return new Map(categories);
          });
        }
      }
    }
  }, [addRecipeRequest]);

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
        initialValue = (initialValue as NonNullable<typeof recipe.categories>).map(
          c => (categories.get(+c) as Category).name,
        );
      }
      if (valueChanged(initialValue as keyof FormFields, v)) {
        await executeAddRecipe(recipe);
        break;
      }
    }
    setCurrentView(View.HOME);
  };

  const handlePaste: ClipboardEventHandler<HTMLDivElement> = e => {
    const file = e.clipboardData.files[0];
    if (!file) {
      return;
    }
    const fr = new FileReader();
    fr.addEventListener("load", () => setForm({ ...form, imgSrc: fr.result as string }));
    fr.readAsDataURL(e.clipboardData.files[0]);
  };

  return (
    <div
      id="add-modal"
      className={visible ? "visible" : ""}
      style={{ transitionDuration: `${transitionDuration}ms` }}
      onPaste={handlePaste}
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
              disabled={
                addRecipeRequest.status === AsyncRequestStatus.PENDING ||
                !form.name ||
                scrapeRequest.status === AsyncRequestStatus.PENDING
              }
            >
              Save Recipe
            </Button>
            <Button
              id="add-modal-scrape"
              onClick={() => executeScrape(urlToScrape)}
              disabled={
                addRecipeRequest.status === AsyncRequestStatus.PENDING ||
                scrapeRequest.status === AsyncRequestStatus.PENDING ||
                urlToScrape === ""
              }
            >
              Scrape
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
