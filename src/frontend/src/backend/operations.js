import { prefix, wrapFetch } from "../lib/common";

export const refreshIdToken = () => {
  const refreshToken = localStorage.getItem(`${prefix}refreshToken`);
  if (!refreshToken) {
    return Promise.reject("No refresh token");
  }
  const body = { refreshToken };

  return wrapFetch("auth/refreshidtoken", {
    options: {
      method: "POST",
      body,
    },
  }).then(([res, status]) => {
    if (status >= 400) {
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

export const signUp = (email, password) => {
  const body = { email, password };

  return wrapFetch("auth/signup", {
    options: {
      method: "POST",
      body,
    },
  }).then(([res, status]) => {
    if (status >= 400) {
      throw new Error(res.message);
    }
    return res.message;
  });
};

export const signIn = (email, password) => {
  const body = { email, password };

  return wrapFetch("auth/signin", {
    options: {
      method: "POST",
      body,
    },
  }).then(([res, status]) => {
    if (status >= 400) {
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

export const forgotPassword = email => {
  const body = { email };

  return wrapFetch("auth/forgotpassword", {
    options: {
      method: "POST",
      body,
    },
  }).then(([res, status]) => {
    if (status >= 400) {
      throw new Error(res.message);
    }
    return res.message;
  });
};

export const scrape = url => {
  return wrapFetch("scrape", { params: { url } }).then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });
};

export const getAllRecipes = () => {
  return wrapFetch("recipes").then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });
};

export const getAllCategories = () => {
  return wrapFetch("categories").then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });
};

export const addRecipe = (body, recipeId) => {
  return (recipeId !== null
    ? wrapFetch(`recipes/${recipeId}`, {
        options: { method: "PUT", body },
      })
    : wrapFetch("recipes", {
        options: { method: "POST", body },
      })
  ).then(([res, status]) => {
    if (status !== 200 && status !== 201) {
      throw new Error(res.message);
    }
    return res.data;
  });
};

export const addRecipes = recipes => {
  return wrapFetch("recipes", {
    options: { method: "PUT", body: { recipes } },
  }).then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });
};

export const deleteRecipe = recipeId => {
  return wrapFetch(`recipes/${recipeId}`, {
    options: { method: "DELETE" },
  }).then(([res, status]) => {
    if (status !== 204) {
      throw new Error(res.message);
    }
  });
};

export const addCategory = (name, categoryId) => {
  return (categoryId
    ? wrapFetch(`categories/${categoryId}`, {
        options: { method: "PUT", body: { name } },
      })
    : wrapFetch("categories", {
        options: { method: "POST", body: { name } },
      })
  ).then(([res]) => res.data);
};

export const deleteCategory = category => {
  return wrapFetch(`categories/${category}`, {
    options: { method: "DELETE" },
  }).then(([res, status]) => {
    if (status > 204) {
      throw new Error(res.message);
    }
    return res.data;
  });
};
