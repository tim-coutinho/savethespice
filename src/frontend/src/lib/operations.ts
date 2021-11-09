import { api, prefix } from "./common";
import { Category, Recipe } from "../types";

interface RefreshIdTokenResponseData {
  refreshTokenExpired: boolean;
  idToken: string;
  user: string;
}

export const refreshIdToken = (): Promise<string> => {
  const refreshToken = localStorage.getItem(`${prefix}refreshToken`);
  if (!refreshToken) {
    return Promise.reject("No refresh token");
  }
  const body = { refreshToken };

  return api
    .post<RefreshIdTokenResponseData, typeof body>("auth/refreshidtoken", body)
    .then(([res, status]) => {
      if (status >= 400) {
        if (res.data?.refreshTokenExpired) {
          localStorage.removeItem(`${prefix}refreshToken`);
          return "";
        }
        throw new Error(res.message);
      }
      const { idToken, user } = res.data;
      sessionStorage.setItem(`${prefix}idToken`, idToken);
      return user;
    });
};

export const signUp = (email: string, password: string): Promise<string> => {
  const body = { email, password };

  return api.post<undefined, string>("auth/signup", typeof body).then(([res, status]) => {
    if (status >= 400) {
      throw new Error(res.message);
    }
    return res.message;
  });
};

interface SignInResponseData {
  idToken: string;
  refreshToken: string;
  user: string;
}

export const signIn = (email: string, password: string): Promise<string> => {
  const body = { email, password };

  return api.post<SignInResponseData, typeof body>("auth/signin", body).then(([res, status]) => {
    if (status >= 400) {
      throw new Error(res.message);
    }
    const { idToken, refreshToken, user } = res.data;
    localStorage.setItem(`${prefix}refreshToken`, refreshToken);
    sessionStorage.setItem(`${prefix}idToken`, idToken);
    return user;
  });
};

export const signOut = (): Promise<void> => {
  return new Promise<void>(resolve => {
    localStorage.removeItem(`${prefix}refreshToken`);
    sessionStorage.removeItem(`${prefix}idToken`);
    resolve();
  });
};

export const forgotPassword = (email: string): Promise<string> => {
  const body = JSON.stringify({ email });

  return api.post<undefined, string>("auth/forgotpassword", body).then(([res, status]) => {
    if (status >= 400) {
      throw new Error(res.message);
    }
    return res.message;
  });
};

export const scrape = (url: string): Promise<Recipe> => {
  return api.get<Recipe>("scrape", { url }).then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });
};

interface GetAllRecipesResponseData {
  recipes: Recipe[];
}

export const getAllRecipes = (): Promise<GetAllRecipesResponseData> =>
  api.get<GetAllRecipesResponseData>("recipes").then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });

interface GetAllCategoriesResponseData {
  categories: Category[];
}

export const getAllCategories = (): Promise<GetAllCategoriesResponseData> =>
  api.get<GetAllCategoriesResponseData>("categories").then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });

export interface AddRecipeResponseData extends Recipe {
  existingCategories?: number[];
  newCategories?: Category[];
  categoryFailedAdds?: string[];
}

export const addRecipe = (recipe: Recipe, recipeId?: number): Promise<AddRecipeResponseData> =>
  (recipeId !== undefined
    ? api.put<AddRecipeResponseData, Recipe>(`recipes/${recipeId}`, recipe)
    : api.post<AddRecipeResponseData, Recipe>("recipes", recipe)
  ).then(([res, status]) => {
    if (status !== 200 && status !== 201) {
      throw new Error(res.message);
    }
    return res.data;
  });

interface AddRecipesResponseData extends AddRecipeResponseData {
  recipes?: Recipe[];
  failedAdds?: Recipe[];
}

export const addRecipes = (recipes: Recipe[]): Promise<AddRecipesResponseData> =>
  api.put<AddRecipesResponseData, Recipe[]>("recipes", recipes).then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });

export const deleteRecipe = (recipeId: number): Promise<void> =>
  api.delete(`recipes/${recipeId}`).then(([res, status]) => {
    if (status !== 204) {
      throw new Error(res.message);
    }
  });

export const addCategory = (categoryName: string, categoryId?: number): Promise<Category> => {
  const body = { name: categoryName };
  return (
    categoryId !== undefined
      ? api.put<Category, typeof body>(`categories/${categoryId}`, body)
      : api.post<Category, typeof body>("categories", body)
  ).then(([res]) => res.data);
};

interface DeleteCategoryResponseData {
  updatedRecipes: number[];
  failedUpdatedRecipes: number[];
}

export const deleteCategory = (categoryId: number): Promise<DeleteCategoryResponseData> =>
  api.delete<DeleteCategoryResponseData>(`categories/${categoryId}`).then(([res, status]) => {
    if (status > 204) {
      throw new Error(res.message);
    }
    return res.data;
  });
