/* eslint-disable */
import type { DeleteCategoriesResponse } from "../types/DeleteCategoriesResponse";
import type { DeleteCategoryResponse } from "../types/DeleteCategoryResponse";
import type { GetCategoriesResponse } from "../types/GetCategoriesResponse";
import type { GetCategoryResponse } from "../types/GetCategoryResponse";
import type { PatchCategoriesResponse } from "../types/PatchCategoriesResponse";
import type { PatchCategoryRequest } from "../types/PatchCategoryRequest";
import type { PostCategoryRequest } from "../types/PostCategoryRequest";
import type { PostCategoryResponse } from "../types/PostCategoryResponse";
import type { PutCategoryRequest } from "../types/PutCategoryRequest";
import type { PutCategoryResponse } from "../types/PutCategoryResponse";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class CategoriesService {

  /**
   * Get Categories
   * Get all categories in the database.
   * @returns GetCategoriesResponse Successful Response
   * @throws ApiError
   */
  public static getCategories(): CancelablePromise<GetCategoriesResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/private/categories",
    });
  }

  /**
   * Post Category
   * Post a category to the database.
   * @param requestBody
   * @returns PostCategoryResponse Successful Response
   * @throws ApiError
   */
  public static postCategory(
    requestBody: PostCategoryRequest,
  ): CancelablePromise<PostCategoryResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/private/categories",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Categories
   * Batch delete a list of category IDs from the database.
   * @param requestBody
   * @returns DeleteCategoriesResponse Successful Response
   * @throws ApiError
   */
  public static deleteCategories(
    requestBody: number[],
  ): CancelablePromise<DeleteCategoriesResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/private/categories",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Patch Categories
   * Batch update a list of categories in the database.
   * @param requestBody
   * @returns PatchCategoriesResponse Successful Response
   * @throws ApiError
   */
  public static patchCategories(
    requestBody: Record<string, PatchCategoryRequest>,
  ): CancelablePromise<PatchCategoriesResponse> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/private/categories",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Category
   * Get a specific category in the database.
   * @param categoryId
   * @returns GetCategoryResponse Successful Response
   * @throws ApiError
   */
  public static getCategory(
    categoryId: number,
  ): CancelablePromise<GetCategoryResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/private/categories/{category_id}",
      path: {
        'category_id': categoryId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Put Category
   * Put a category to the database, replacing the specified entry.
   * @param categoryId
   * @param requestBody
   * @returns PutCategoryResponse Successful Response
   * @throws ApiError
   */
  public static putCategory(
    categoryId: number,
    requestBody: PutCategoryRequest,
  ): CancelablePromise<PutCategoryResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/private/categories/{category_id}",
      path: {
        'category_id': categoryId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Category
   * Delete the specified category from the database.
   * @param categoryId
   * @returns DeleteCategoryResponse Successful Response
   * @throws ApiError
   */
  public static deleteCategory(
    categoryId: number,
  ): CancelablePromise<DeleteCategoryResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/private/categories/{category_id}",
      path: {
        'category_id': categoryId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Patch Category
   * Patch a category in the database, updating the specified entry.
   * @param categoryId
   * @param requestBody
   * @returns void
   * @throws ApiError
   */
  public static patchCategory(
    categoryId: number,
    requestBody: PatchCategoryRequest,
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/private/categories/{category_id}",
      path: {
        'category_id': categoryId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

}