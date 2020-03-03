export function getById(id) {
    const elem = document.getElementById(id);
    if (!elem) {
        throw ReferenceError(`${id} does not exist`);
    }
    return elem;
}
