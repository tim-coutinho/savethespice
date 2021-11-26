import { ChangeEvent, EventHandler, KeyboardEvent, ReactElement, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  copyToClipboard,
  SignedInState,
  Theme,
  transitionDuration,
  UNSET,
  View,
} from "../lib/common";
import {
  allRecipesState,
  categoriesState,
  currentViewState,
  itemIdToDeleteState,
  modalActiveState,
  selectedCategoryIdState,
  signedInState,
  themeState,
} from "../store";

import "./Sidebar.scss";

import SidebarItem from "./SidebarItem";
import TextInput from "./TextInput";
import { addCategory, getAllCategories, signOut } from "../lib/operations";
import { Category } from "../types";
import { useAsync, useRenderTimeout } from "../lib/hooks";

interface SidebarProps {
  handleDeleteCategory: () => void;
}

export default ({ handleDeleteCategory }: SidebarProps): ReactElement => {
  const [addHover, setAddHover] = useState(false);
  const [floatingTextVisible, setFloatingTextVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [shiftedLeft, setShiftedLeft] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useRecoilState(selectedCategoryIdState);
  const [theme, setTheme] = useRecoilState(themeState);
  const [allCategories, setAllCategories] = useRecoilState(categoriesState);
  const modalActive = useRecoilValue(modalActiveState);
  const allRecipes = useRecoilValue(allRecipesState);
  const setCategoryIdToDelete = useSetRecoilState(itemIdToDeleteState);
  const setCurrentView = useSetRecoilState(currentViewState);
  const setSignedIn = useSetRecoilState(signedInState);
  const [, inputRendered, setInputVisible] = useRenderTimeout(transitionDuration);
  const [executeAddCategory, addCategoryRequest] = useAsync(addCategory);
  const [executeGetAllCategories, getAllCategoriesRequest] = useAsync(getAllCategories);

  useEffect(() => {
    executeGetAllCategories();
  }, []);

  useEffect(() => {
    if (getAllCategoriesRequest.value) {
      setAllCategories(
        new Map(getAllCategoriesRequest.value.categories.map(c => [c.categoryId, c])),
      );
    }
  }, [getAllCategoriesRequest]);

  useEffect(() => {
    setInputVisible(shiftedLeft);
  }, [shiftedLeft]);

  const handleExport = (): void =>
    copyToClipboard(
      JSON.stringify(
        Array.from(allRecipes).map(([, recipe]) =>
          recipe.categories
            ? {
                ...recipe,
                categories: recipe.categories.map(c => (allCategories.get(c) as Category).name),
                recipeId: undefined,
                createTime: undefined,
                updateTime: undefined,
              }
            : { ...recipe, recipeId: undefined, createTime: undefined, updateTime: undefined },
        ),
      ),
    );

  const handleBlur = (): void => {
    newCategoryName === "" && setShiftedLeft(false);
  };

  const handleNewCategoryChange: EventHandler<
    KeyboardEvent<HTMLInputElement> & ChangeEvent<HTMLInputElement>
  > = async e => {
    if (!e.key) {
      setNewCategoryName(e.currentTarget.value);
    } else if (e.key === "Escape") {
      setNewCategoryName("");
      setShiftedLeft(false);
    } else if (e.key === "Enter" && newCategoryName !== "") {
      // Ensure category with this name doesn't already exist
      if (Array.from(allCategories).some(([, { name }]) => name === newCategoryName)) {
        return;
      }
      executeAddCategory(newCategoryName);
    }
  };

  useEffect(() => {
    const { value } = addCategoryRequest;
    if (value !== null) {
      setAllCategories(categories => new Map(categories.set(value.categoryId, value)));
      setNewCategoryName("");
      setShiftedLeft(false);
    }
  }, [addCategoryRequest]);

  return (
    <aside id="sidebar" className={modalActive ? "disabled" : ""}>
      <span
        id="categories-header"
        className={`sidebar-item sidebar-section ${shiftedLeft ? "shifted-left" : ""}`}
      >
        <div id="categories-header-left">
          Categories
          <i
            className={`fa${addHover ? "" : "r"} fa-plus-square`}
            onClick={() => setShiftedLeft(true)}
            onMouseEnter={() => setAddHover(true)}
            onMouseLeave={() => setAddHover(false)}
          />
        </div>
        {inputRendered && (
          <TextInput
            placeholder="Category Name"
            name="categoryName"
            setValue={handleNewCategoryChange}
            value={newCategoryName}
            autofocus
            autofocusDelay={200}
            onBlur={handleBlur}
            width="13.5em"
          />
        )}
      </span>
      <ul id="sidebar-list">
        <SidebarItem
          key={UNSET}
          categoryName="All Recipes"
          classes="sidebar-item sidebar-category"
          handleClick={() => setSelectedCategoryId(UNSET)}
          selected={selectedCategoryId === UNSET}
        />
        {Array.from(allCategories)
          .sort(([, { name: name1 }], [, { name: name2 }]) =>
            name1.toLowerCase() >= name2.toLowerCase() ? 1 : -1,
          )
          .map(([categoryId, { name }]) => (
            <SidebarItem
              key={categoryId}
              categoryName={name}
              classes="sidebar-item sidebar-category"
              handleClick={() => setSelectedCategoryId(categoryId)}
              selected={selectedCategoryId === categoryId}
              handleDelete={e => {
                e.stopPropagation();
                setCategoryIdToDelete(categoryId);
                handleDeleteCategory();
              }}
            />
          ))}
        <hr />
        <SidebarItem
          key="Import Recipes"
          categoryName="Import Recipes"
          classes="sidebar-item import"
          handleClick={() => setCurrentView(View.IMPORT)}
        />
        <span className={`${floatingTextVisible ? "float" : ""}`} style={{ position: "relative" }}>
          <SidebarItem
            key="Export Recipes"
            categoryName="Export Recipes"
            classes="sidebar-item export"
            handleClick={() => {
              handleExport();
              if (floatingTextVisible) {
                return;
              }
              setFloatingTextVisible(true);
              setTimeout(() => setFloatingTextVisible(false), 2000);
            }}
          />
        </span>
        <SidebarItem
          key="Theme"
          categoryName="Theme"
          classes={`sidebar-item theme ${theme}`}
          handleClick={() => setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
        />
        <SidebarItem
          key="Sign Out"
          categoryName="Sign Out"
          classes="sidebar-item signout"
          handleClick={() => signOut().then(() => setSignedIn(SignedInState.SIGNED_OUT))}
        />
      </ul>
    </aside>
  );
};
