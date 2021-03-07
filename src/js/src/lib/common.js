import { endpoint } from "./secrets";

const serialize = obj =>
  encodeURI(
    Object.entries(obj ?? {}).reduce(
      (acc, [key, val]) => `${acc}${acc === "" ? "?" : "&"}${key}=${val}`,
      ""
    )
  );

export const prefix = "SaveTheSpice-";

export const Views = {
  ADD: "Add",
  DELETE: "Delete",
  EDIT: "Edit",
  HOME: "Home",
  SIDEBAR: "Sidebar",
};

export const SignedInStates = {
  SIGNED_IN: "signed_in",
  PENDING: "pending",
  REFRESHING_ID_TOKEN: "refreshing_id_token",
  SIGNED_OUT: "signed_out",
};

export const colors = {
  OD_RED: "#e06c75",
  OD_DARK_RED: "#be5046",
  OD_GREEN: "#98c379",
  OD_YELLOW: "#e5c07b",
  OD_DARK_YELLOW: "#d19a66",
  OD_BLUE: "#61afef",
  OD_PURPLE: "#c678dd",
  OD_CYAN: "#56b6c2",
  OD_WHITE: "#abb2bf",
  OD_BLACK: "#282c34",
  WHITE: "#ffffff",
};

export const wrapFetch = (resource, options = { options: { method: "GET" }, params: "" }) =>
  fetch(`${endpoint}/${resource}${serialize(options.params)}`, {
    headers: {
      Authorization: sessionStorage.getItem(`${prefix}idToken`),
      "Content-Type": "application/json",
    },
    ...options.options,
    body: JSON.stringify(options.options?.body) ?? null,
  })
    .then(async res => {
      let body = {};
      if (res.status !== 204) {
        body = await res.json();
      }
      return [body, res.status];
    })
    .catch(console.error); // Only rejects on network errors

export const getById = elementId => {
  const elem = document.getElementById(elementId);
  if (!elem) {
    throw ReferenceError(`${elementId} does not exist`);
  }
  return elem;
};

export const copyToClipboard = str => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
  el.style.position = "absolute";
  el.style.left = "-9999px"; // Move outside the screen to make it invisible
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0 // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0) // Store selection if found
      : false;
  el.select(); // Select the <textarea> content
  document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges(); // Unselect everything
    document.getSelection().addRange(selected); // Restore original selection
  }
};
