export function getById(elementId) {
  const elem = document.getElementById(elementId);
  if (!elem) {
    throw ReferenceError(`${elementId} does not exist`);
  }
  return elem;
}
