export function getById(elementId) {
  const elem = document.getElementById(elementId);
  if (!elem) {
    throw ReferenceError(`${elementId} does not exist`);
  }
  return elem;
}

export function copyToClipboard(str) {
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
}
