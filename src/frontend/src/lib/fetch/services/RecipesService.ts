/* eslint-disable */
import type { DeleteRecipeResponse } from "../types/DeleteRecipeResponse";
import type { DeleteRecipesResponse } from "../types/DeleteRecipesResponse";
import type { GetRecipeResponse } from "../types/GetRecipeResponse";
import type { GetRecipesResponse } from "../types/GetRecipesResponse";
import type { PostRecipeRequest } from "../types/PostRecipeRequest";
import type { PostRecipeResponse } from "../types/PostRecipeResponse";
import type { PutRecipeRequest } from "../types/PutRecipeRequest";
import type { PutRecipeResponse } from "../types/PutRecipeResponse";
import type { PutRecipesResponse } from "../types/PutRecipesResponse";
import type { ScrapeRecipeResponse } from "../types/ScrapeRecipeResponse";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class RecipesService {

  /**
   * Get Recipes
   * Get all recipes in the database.
   * @returns GetRecipesResponse Successful Response
   * @throws ApiError
   */
  public static getRecipes(): CancelablePromise<GetRecipesResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/private/recipes",
    });
  }

  /**
   * Put Recipes
   * Batch put a list of recipes to the database.
   * @param requestBody
   * @returns PutRecipesResponse Successful Response
   * @throws ApiError
   */
  public static putRecipes(
    requestBody: PutRecipeRequest[],
  ): CancelablePromise<PutRecipesResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/private/recipes",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Post Recipe
   * Post a recipe to the database.
   * @param requestBody
   * @returns PostRecipeResponse Successful Response
   * @throws ApiError
   */
  public static postRecipe(
    requestBody: PostRecipeRequest,
  ): CancelablePromise<PostRecipeResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/private/recipes",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Recipes
   * Batch delete a list of recipe IDs from the database.
   * @param requestBody
   * @returns DeleteRecipesResponse Successful Response
   * @throws ApiError
   */
  public static deleteRecipes(
    requestBody: number[],
  ): CancelablePromise<DeleteRecipesResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/private/recipes",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Recipe
   * Get a specific recipe in the database.
   * @param recipeId
   * @returns GetRecipeResponse Successful Response
   * @throws ApiError
   */
  public static getRecipe(
    recipeId: number,
  ): CancelablePromise<GetRecipeResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/private/recipes/{recipe_id}",
      path: {
        'recipe_id': recipeId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Put Recipe
   * Put a recipe to the database, replacing the specified entry.
   * @param recipeId
   * @param requestBody
   * @returns PutRecipeResponse Successful Response
   * @throws ApiError
   */
  public static putRecipe(
    recipeId: number,
    requestBody: PutRecipeRequest,
  ): CancelablePromise<PutRecipeResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/private/recipes/{recipe_id}",
      path: {
        'recipe_id': recipeId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Recipe
   * Delete a recipe in the database by ID.
   * @param recipeId
   * @returns DeleteRecipeResponse Successful Response
   * @throws ApiError
   */
  public static deleteRecipe(
    recipeId: number,
  ): CancelablePromise<DeleteRecipeResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/private/recipes/{recipe_id}",
      path: {
        'recipe_id': recipeId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Scrape Recipe
   * Scrape a url for recipe info.
   * @param url
   * @returns ScrapeRecipeResponse Successful Response
   * @throws ApiError
   */
  public static scrapeRecipe(
    url: string,
  ): CancelablePromise<ScrapeRecipeResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/private/scrape",
      query: {
        'url': url,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

}