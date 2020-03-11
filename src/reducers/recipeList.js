const recipeList = (state = [], action) => {
    switch (action.type) {
    case "ADD_RECIPE":
        return [
            ...state,
            {

            }
        ]
    case "REMOVE_RECIPE":
        return null;
    default:
        return state;
    }
}

export default recipeList;
