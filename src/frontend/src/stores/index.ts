import { atom } from "recoil";

import { SignedInState, View } from "@/utils/common";

export const filterState = atom({ key: "filterState", default: "" });

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

export const sidebarOpenedState = atom({
  key: "sidebarOpenedState",
  default: false,
});
