import { Category, CategoryMap, Recipe, RecipeMap } from "@/types";

import { api, prefix } from "./common";

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
        }
        throw new Error(res.message);
      }
      const { idToken, user } = res.data;
      sessionStorage.setItem(`${prefix}idToken`, idToken);
      return user;
    });
};

export const signUp = (email: string, password: string): Promise<[string, number]> => {
  const body = { email, password };

  return api.post<undefined, typeof body>("auth/signup", body).then(([res, status]) => {
    if (status >= 400) {
      throw new Error(res.message);
    }
    return [res.message, status];
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

export const signOut = (): void => {
  localStorage.removeItem(`${prefix}refreshToken`);
  sessionStorage.removeItem(`${prefix}idToken`);
};

export const forgotPassword = (email: string): Promise<string> => {
  const body = { email };

  return api.post<undefined, typeof body>("auth/forgotpassword", body).then(([res, status]) => {
    if (status >= 400) {
      throw new Error(res.message);
    }
    return res.message;
  });
};

export interface ScrapeResponseData extends Omit<Recipe, "categories"> {
  categories: string[];
}

export const scrape = (url: string): Promise<ScrapeResponseData | undefined> =>
  api.get<ScrapeResponseData>("scrape", { url }).then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });

interface GetAllRecipesResponseData {
  recipes: Recipe[];
}

export const getAllRecipes = (): Promise<RecipeMap> =>
  api.get<GetAllRecipesResponseData>("recipes").then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return new Map(res.data.recipes.map(r => [r.recipeId, r]));
  });

interface GetAllCategoriesResponseData {
  categories: Category[];
}

export const getAllCategories = (): Promise<CategoryMap> =>
  api.get<GetAllCategoriesResponseData>("categories").then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return new Map(res.data.categories.map(c => [c.categoryId, c]));
  });

export interface FormFields
  extends Omit<Recipe, "userId" | "recipeId" | "createTime" | "updateTime" | "categories"> {
  categories: string[];
}

export interface AddRecipeResponseData extends Recipe {
  existingCategories?: number[];
  newCategories?: Category[];
  categoryFailedAdds?: string[];
}

export const addRecipe = (recipe: FormFields, recipeId?: number): Promise<AddRecipeResponseData> =>
  (recipeId !== undefined
    ? api.put<AddRecipeResponseData, FormFields>(`recipes/${recipeId}`, recipe)
    : api.post<AddRecipeResponseData, FormFields>("recipes", recipe)
  ).then(([res, status]) => {
    if (status !== 200 && status !== 201) {
      throw new Error(res.message);
    }
    return res.data;
  });

interface AddRecipesResponseData
  extends Pick<
    AddRecipeResponseData,
    "existingCategories" | "newCategories" | "categoryFailedAdds"
  > {
  recipes?: Recipe[];
  failedAdds?: Recipe[];
}

export const addRecipes = (recipes: Recipe[]): Promise<AddRecipesResponseData> =>
  api
    .put<AddRecipesResponseData, { recipes: Recipe[] }>("recipes", { recipes })
    .then(([res, status]) => {
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

export const deleteCategory = (
  categoryId: number,
): Promise<DeleteCategoryResponseData | undefined> =>
  api.delete<DeleteCategoryResponseData>(`categories/${categoryId}`).then(([res, status]) => {
    if (status > 204) {
      throw new Error(res.message);
    }
    return res.data;
  });
