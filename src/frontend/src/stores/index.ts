import { atom } from "recoil";

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

export const sidebarOpenedState = atom({
  key: "sidebarOpenedState",
  default: false,
});
