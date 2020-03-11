import { combineReducers } from "redux";
import todos from "./todos";
import recipeList from "./recipeList";

const reducers = {
    todos,
    recipeList,
};

export default combineReducers(reducers);
