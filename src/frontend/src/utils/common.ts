export const prefix = "SaveTheSpice-";
export const UNSET = -1;

export const View: Record<
  "ADD" | "DELETE" | "EDIT" | "HOME" | "IMPORT" | "SIDEBAR" | "AUTH",
  { modal: boolean }
> = {
  ADD: { modal: true },
  DELETE: { modal: true },
  EDIT: { modal: true },
  HOME: { modal: false },
  IMPORT: { modal: true },
  SIDEBAR: { modal: false },
  AUTH: { modal: false },
};

export enum SignedInState {
  SIGNED_IN = "signed_in",
  SIGNED_OUT = "signed_out",
}

export enum Color {
  OD_RED = "#e06c75",
  OD_DARK_RED = "#be5046",
  OD_GREEN = "#98c379",
  OD_YELLOW = "#e5c07b",
  OD_DARK_YELLOW = "#d19a66",
  OD_BLUE = "#61afef",
  OD_PURPLE = "#c678dd",
  OD_CYAN = "#56b6c2",
  OD_WHITE = "#abb2bf",
  OD_BLACK = "#282c34",
  WHITE = "#ffffff",
}
