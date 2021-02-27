/* eslint-disable */
import { prefix, wrapFetch } from "../utils/common";

export const signUp = (email, password) => {
  const body = JSON.stringify({ email, password });

  return wrapFetch("auth", {
    options: {
      method: "POST",
      body,
    },
    params: { operation: "SIGN_UP" },
  })
    .then(res => {
      if (res.error) {
        throw new Error(res.message);
      }
      return res.message;
    })
    .catch(res => {
      console.error(res);
      return res.message;
    });
};

export const refreshIdToken = () => {
  const refreshToken = localStorage.getItem(`${prefix}refreshToken`);
  const body = JSON.stringify({ refreshToken });

  return wrapFetch("auth", {
    options: {
      method: "POST",
      body,
    },
    params: { operation: "REFRESH_ID_TOKEN" },
  }).then(res => {
    if (res.error) {
      if (res.data?.refreshTokenExpired) {
        localStorage.removeItem(`${prefix}refreshToken`);
        return null;
      }
      throw new Error(res.message);
    }
    const { idToken, user } = res.data;
    sessionStorage.setItem(`${prefix}idToken`, idToken);
    return user;
  });
};

export const signIn = (email, password) => {
  const body = { email, password };

  return wrapFetch("auth", {
    options: {
      method: "POST",
      body,
    },
    params: { operation: "SIGN_IN" },
  }).then(res => {
    if (res.error) {
      throw new Error(res.message);
    }
    const { idToken, refreshToken, user } = res.data;
    localStorage.setItem(`${prefix}refreshToken`, refreshToken);
    sessionStorage.setItem(`${prefix}idToken`, idToken);
    return user;
  });
};

export const signOut = () => {
  return new Promise(resolve => {
    localStorage.removeItem(`${prefix}refreshToken`);
    sessionStorage.removeItem(`${prefix}idToken`);
    resolve();
  });
};

export const scrape = url => {
  return wrapFetch("scrape", { params: { url } })
    .then(res => res.data)
    .catch(console.error);
};

export const getAllRecipes = () => {
  return wrapFetch("recipes")
    .then(res => res.data)
    .catch(console.error);
};

export const getAllCategories = () => {
  return wrapFetch("categories")
    .then(res => res.data)
    .catch(console.error);
};

export const addRecipe = (values, recipeId) => {
  return (recipeId
    ? wrapFetch(`recipes/${recipeId}`, {
        options: { method: "PATCH", body: JSON.stringify(values) },
      })
    : wrapFetch("recipes", {
        options: { method: "POST", body: JSON.stringify(values) },
      })
  )
    .then(res => res.data)
    .catch(console.error);
};

export const deleteRecipe = recipeId => {
  return wrapFetch(`recipes/${recipeId}`, {
    options: { method: "DELETE" },
  }).catch(console.error);
};

export const addCategory = (category, categoryId) => {
  return (categoryId
    ? wrapFetch(`categories/${categoryId}`, {
        options: { method: "PATCH", body: JSON.stringify({ name: category }) },
      })
    : wrapFetch("categories", {
        options: { method: "POST", body: JSON.stringify({ name: category }) },
      })
  )
    .then(res => res.data)
    .catch(console.error);
};

export const deleteCategory = category => {
  return wrapFetch(`categories/${category}`, {
    options: { method: "DELETE" },
  }).catch(console.error);
};
