import { atom } from "recoil";

import { SignedInState, UNSET, View } from "@/lib/common";

export const filterState = atom({ key: "filterState", default: "" });

export const itemToDeleteState = atom<{ type: "category" | "recipe"; id: number }>({
  key: "itemToDeleteState",
  default: { type: "recipe", id: UNSET },
});

export const selectedCategoryIdState = atom({
  key: "selectedCategoryIdState",
  default: UNSET,
});

export const selectedRecipeIdState = atom({
  key: "selectedRecipeIdState",
  default: UNSET,
});

export const filterOptionsState = atom({
  key: "filterOptionsState",
  default: {
    name: true,
    desc: true,
    ingredients: true,
    instructions: true,
  },
});

export const currentViewState = atom({
  key: "currentViewState",
  default: View.HOME,
});

export const signedInState = atom({
  key: "signedInState",
  default: SignedInState.SIGNED_IN,
});
