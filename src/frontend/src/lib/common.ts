import { useRef, useState } from "react";
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

export const useRenderTimeout: (timeout?: number) => [boolean, boolean, (inView: boolean) => void] =
  (timeout = 300) => {
    const inFlight = useRef<boolean>(false);
    const [visible, setVisible] = useState(false);
    const [rendered, setRendered] = useState(false);

    const setInView = (inView: boolean) => {
      setVisible(inView);
      if (inView) {
        inFlight.current = false;
        setRendered(true);
      } else {
        inFlight.current = true;
        setTimeout(() => inFlight.current && setRendered(false), timeout);
      }
    };
    return [visible, rendered, setInView];
  };

export const View: Record<string, { id: number; modal: boolean }> = {
  ADD: { id: 0, modal: true },
  DELETE_CATEGORY: { id: 1, modal: true },
  DELETE_RECIPE: { id: 2, modal: true },
  EDIT: { id: 3, modal: true },
  HOME: { id: 4, modal: false },
  IMPORT: { id: 5, modal: true },
  SIDEBAR: { id: 6, modal: false },
  SIGN_IN: { id: 7, modal: false },
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

export type ThemeSetting = "light" | "dark";

export class Theme {
  private static readonly storageName: string = `${prefix}theme`;
  static readonly LIGHT: ThemeSetting = "light";
  static readonly DARK: ThemeSetting = "dark";

  static get setting(): ThemeSetting {
    return (
      (localStorage.getItem(Theme.storageName) as ThemeSetting) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.DARK : Theme.LIGHT)
    );
  }

  static set setting(themeSetting: ThemeSetting) {
    localStorage.setItem(Theme.storageName, themeSetting);
    document.documentElement.setAttribute("data-theme", themeSetting);
  }
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
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
  el.style.position = "absolute";
  el.style.left = "-9999px"; // Move outside the screen to make it invisible
  document.body.appendChild(el);
  const selected =
    (document.getSelection()?.rangeCount ?? 0) > 0 // Check if there is any content selected previously
      ? document.getSelection()?.getRangeAt(0) // Store selection if found
      : false;
  el.select(); // Select the <textarea> content
  document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);
  if (selected) {
    document.getSelection()?.removeAllRanges(); // Unselect everything
    document.getSelection()?.addRange(selected); // Restore original selection
  }
};
