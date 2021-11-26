import { endpoint } from "./secrets";

const serialize = (obj?: Record<string, unknown> | string) =>
  encodeURI(
    Object.entries(obj ?? {}).reduce(
      (acc, [key, val]) => `${acc}${acc === "" ? "?" : "&"}${key}=${val}`,
      "",
    ),
  );

export const prefix = "SaveTheSpice-";
export const transitionDuration = 300;
export const UNSET = -1;

export const View: Record<string, { modal: boolean }> = {
  ADD: { modal: true },
  DELETE: { modal: true },
  EDIT: { modal: true },
  HOME: { modal: false },
  IMPORT: { modal: true },
  SIDEBAR: { modal: false },
  SIGN_IN: { modal: false },
};

export enum SignedInState {
  SIGNED_IN = "signed_in",
  PENDING = "pending",
  REFRESHING_ID_TOKEN = "refreshing_id_token",
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

interface FetchResponse<T> {
  data: T;
  message: string;
}

const wrapFetch = <T = undefined>(
  resource: string,
  options: { options?: RequestInit; params?: string | Record<string, unknown> } = {
    options: { method: "GET" },
    params: "",
  },
): Promise<[FetchResponse<T>, number]> =>
  fetch(`${endpoint}/${resource}${serialize(options.params)}`, {
    headers: {
      Authorization: sessionStorage.getItem(`${prefix}idToken`) as string,
      "Content-Type": "application/json",
    },
    ...options.options,
    body: options.options?.body ?? null,
  })
    .then(async res => {
      if (res.status === 204) {
        return [{}, res.status];
      }
      const body = await res.json();
      return [body, res.status];
    })
    .catch(e => {
      console.error(e);
      return [{}, 500];
    }) as Promise<[FetchResponse<T>, number]>; // Fetch only rejects on network errors

export const api = {
  get: <T>(resource: string, params?: Record<string, unknown>) =>
    wrapFetch<T>(resource, { options: { method: "GET" }, params }),
  post: <T, S>(resource: string, body: S) =>
    wrapFetch<T>(resource, { options: { method: "POST", body: JSON.stringify(body) } }),
  put: <T, S>(resource: string, body: S) =>
    wrapFetch<T>(resource, { options: { method: "PUT", body: JSON.stringify(body) } }),
  delete: <T>(resource: string) => wrapFetch<T>(resource, { options: { method: "DELETE" } }),
};

export const getById = (elementId: string): HTMLElement => {
  const elem = document.getElementById(elementId);
  if (!elem) {
    throw ReferenceError(`${elementId} does not exist`);
  }
  return elem;
};

export const copyToClipboard = (str: string): void => {
  const listener = (e: ClipboardEvent) => {
    e.preventDefault();
    e.clipboardData?.setData("text/plain", str);
    document.removeEventListener("copy", listener);
  };
  document.addEventListener("copy", listener);
  document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
};
